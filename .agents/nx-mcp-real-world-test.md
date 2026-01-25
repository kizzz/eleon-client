# Nx MCP Real-World Test (TIE)

CTX: workspace=src/{project}/client; Nx=18.3.5; Angular=17.3.0; tested projects=host, administration, audit, accounting.
STRUCTURE: host=src/hosts/host; executor=@nx/angular:module-federation-dev-server; remote example=src/modules/administration; exposes=./Administration -> ./src/modules/administration/src/app/app.module.ts; other modules=auditing/accounting/... (see workspace list).

MCP TOOLS:
- nx_docs: OK; use for MF/Workspace/Generators questions.
- nx CLI: `npx nx show projects`; `npx nx show project <name> --json`.
- generators: `npx nx list @nx/angular`; use host/remote/federate-module/component.

MF CONFIG:
- host webpack.config.ts uses withModuleFederation.
- remote webpack.config.ts exposes modules.

WORKFLOWS:
1) discovery: nx show projects -> nx show project <name> -> read project.json -> check webpack.config.ts.
2) create remote: nx list -> nx generate @nx/angular:remote <name> -> configure exposes -> wire host.
3) deps: nx graph -> tsconfig.base.json aliases -> project.json deps -> find imports via `rg`.

ISSUES:
- nx_available_plugins 404: expected if workspace not initialized; optional nx reset.
- WORKSPACE_ROOT config: set env in MCP config.
  - Windows local active: .codex/config.toml
  - Windows Cursor: .cursor/mcp.json
  - Linux Codex: .codex/lin/config.toml
  - Linux Cursor: .cursor/mcp-linux.json
  Example:
  "nx-mcp": { "command": "npx", "args": ["nx-mcp@latest"], "env": { "WORKSPACE_ROOT": "C:\\Workspace" } }

RECOMMEND:
- Start with workspace discovery; use nx_docs before codegen; respect Nx boundaries; use tsconfig.base.json aliases; MF: host loads remotes; remotes expose.

NEXT:
- Test mcp.nx-mcp.nx_workspace / nx_project_details / nx_generators if available; capture findings in agents.md/.agents/strategy.md.
