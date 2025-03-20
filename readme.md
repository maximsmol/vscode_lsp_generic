# VSCode Generic LSP

Extension for registering arbitrary LSP servers

[Download on the VSCode marketplace](https://marketplace.visualstudio.com/items?itemName=maximsmol.vscode-lsp-generic)

## Example

1. Build & install the extension
2. Add the following to VSCode User settings:

```json
{
  "lsp_generic_client": {
    "servers": {
      "bash_test": {
        "name": "Bash (Test)",
        "path": "pnpm",
        "args": ["dlx", "bash-language-server", "start"],
        "documentSelector": ["shellscript"]
      }
    }
  }
}
```

This registers the [bash-language-server](https://github.com/bash-lsp/bash-language-server) for Bash documents, running it using `pnpm dlx`
