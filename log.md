# [2025-01-31 15:00 Pacific]

- prior work
  - https://github.com/llllvvuu/vscode-glspc (dead for 7 months)
  - https://gitlab.com/torokati44/vscode-glspc (dead for 4 years)
  - https://github.com/microsoft/vscode/issues/137885
- references
  - https://code.visualstudio.com/api/language-extensions/language-server-extension-guide
  - https://github.com/microsoft/vscode-extension-samples/tree/3266b1ade77306430e4d8923c9b0d50552443a2f/lsp-sample
- eslint has new config stuff and new typescript integration stuff
- `vscode-languageserver-node` is not documented at all
  - looking for doc generators
  - https://github.com/TypeStrong/typedoc
  - https://github.com/ts-docs/ts-docs (dead for 3 years)
  - using typedoc
    - the package is set up with a bunch of ad hoc scripts and stuff, very annoying

# [2025-02-04 17:27 Pacific]

- finished `main.ts` MVP
- connecting the extension configuration to the LSP creator

# [2025-03-20 12:49 Pacific]

- started working on commands (status command first)
- setup git
- doing other commands: open logs, restart, shutdown, start
