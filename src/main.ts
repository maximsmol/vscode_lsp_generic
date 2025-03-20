import {
  commands,
  ExtensionContext,
  QuickPickItem,
  window,
  workspace,
} from "vscode";
import {
  DocumentSelector,
  Executable,
  LanguageClient,
  State,
} from "vscode-languageclient/node";

import os from "os";
import path from "path";
import fs from "fs/promises";

const resolvedCommands: Record<string, string> = {};
const clients: Record<string, LanguageClient> = {};

type ServerCfg = {
  name: string;
  path: string;
  args: string[];
  documentSelector: DocumentSelector;
  maxRestartCount?: number;
};

const stateNames: Record<State, string> = {
  [State.Stopped]: "Stopped",
  [State.Running]: "Running",
  [State.Starting]: "Starting",
};

const findInPath = async (name: string): Promise<string | undefined> => {
  const parts = process.env["PATH"]?.split(
    os.platform() !== "win32" ? ":" : ";"
  );
  if (parts == null) return;

  for (const p of parts) {
    const bin = path.join(p, name);

    try {
      await fs.access(bin, fs.constants.X_OK);
      return bin;
    } catch {
      continue;
    }
  }

  return;
};

const showClientQuickpick = async ({
  title,
  showState = false,
}: {
  title: string;
  showState?: boolean;
}): Promise<LanguageClient | undefined> => {
  const items = Object.entries(clients).map(
    ([id, x]): [string, QuickPickItem] => [
      id,
      { label: showState ? `${x.name}: ${stateNames[x.state]}` : x.name },
    ]
  );
  const choice = await window.showQuickPick(
    items.map((x) => x[1]),
    {
      title,
    }
  );
  if (choice == null) return;

  const choiceItem = items.find((x) => x[1] === choice);
  if (choiceItem == null) return;

  const client = clients[choiceItem[0]];
  if (client == null) return;

  return client;
};

export const activate = (
  ctx: ExtensionContext
): Thenable<unknown> | undefined => {
  ctx.subscriptions.push(
    commands.registerCommand("lsp_generic_client.status", async () => {
      // todo(maximsmol): this needs a different visual
      await window.showInformationMessage(
        ["Generic LSP server statuses"].join("\n"),
        {
          detail: Object.entries(clients)
            .map(([id, x]) =>
              [
                `#${id} ${x.name}: ${stateNames[x.state]}`,
                ...(resolvedCommands[id] != null ? [resolvedCommands[id]] : []),
                [...x.getFeature("textDocument/didOpen").openDocuments]
                  .map((x) => `- ${x.uri.toString(true)}`)
                  .join("\n"),
              ].join("\n")
            )
            .join("\n\n"),
          modal: true,
        }
      );
    }),
    commands.registerCommand("lsp_generic_client.logs_dialog", async () => {
      const client = await showClientQuickpick({ title: "[LSP] Server logs" });
      if (client == null) return;

      client.outputChannel.show();
    }),
    commands.registerCommand("lsp_generic_client.restart_dialog", async () => {
      const client = await showClientQuickpick({
        title: "[LSP] Restart server",
        showState: true,
      });
      if (client == null) return;

      await client.restart();
    }),
    commands.registerCommand("lsp_generic_client.stop_dialog", async () => {
      const client = await showClientQuickpick({
        title: "[LSP] Stop server",
        showState: true,
      });
      if (client == null) return;

      await client.stop();
    }),
    commands.registerCommand("lsp_generic_client.start_dialog", async () => {
      const client = await showClientQuickpick({
        title: "[LSP] Start server",
        showState: true,
      });
      if (client == null) return;

      await client.start();
    })
  );

  // Create clients
  const cfg = workspace.getConfiguration("lsp_generic_client");

  const deferred: Promise<unknown>[] = [];
  for (const [id, srv] of Object.entries(
    cfg.get("servers") as Record<string, ServerCfg>
  ))
    deferred.push(
      (async () => {
        if (!srv.path.includes("/")) {
          const bin = await findInPath(srv.path);
          if (bin != null) {
            srv.path = bin;
            resolvedCommands[id] = srv.path;
          }
        }

        const srvExec: Executable = {
          command: srv.path,
          args: srv.args,
        };

        const client = new LanguageClient(
          `vscode_lsp_generic.${id}`,
          srv.name,
          {
            run: srvExec,
            debug: srvExec,
          },
          {
            connectionOptions: {
              maxRestartCount: srv.maxRestartCount ?? 0,
            },
            documentSelector: srv.documentSelector,
          }
        );
        clients[id] = client;

        if (!client.needsStart()) return;
        await client.start();
      })()
    );

  return Promise.all(deferred);
};

export const deactivate = (): Thenable<unknown> | undefined =>
  Promise.all(
    Object.values(clients).map(async (x) => {
      if (!x.needsStop()) return;
      await x.stop();
    })
  );
