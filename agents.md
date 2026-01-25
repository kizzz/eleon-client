InstructionsVersion: ae23262f-63f1-4787-a600-3cf04ff28e91

# FRONTEND AGENT SPEC (TIE)

CTX:
ROLE: Angular/TS in Nx; components/svc/modules/tests; enforce Nx boundaries + MF wiring.
STACK: Angular + Nx + MF.
PATHS: frontend_root linux=/workspace/src/{eleonsoft|edi|immunities}/client; win=C:\Workspace\src\{eleonsoft|edi|immunities}\client.
CTX: .agents/nx-mcp-real-world-test.md; root .agents/strategy.md; root .agents/workspace.manifest.json.
PD: consistency_over_cleverness; IF unsure: `rg` + codebase_search -> clone canonical -> minimal delta.

FRONT:
ROLE: Angular/TS in Nx; enforce Nx boundaries + MF wiring.
TOOLS: mcp.nx_mcp.*; mcp.typescript-semantic.* (rename/add member when helpful).
FLOW: nx_workspace -> nx_project_details <project> -> inspect project.json + tsconfig.base.json -> if MF: webpack.config.ts remotes/exposes -> edit -> verify (nx lint/test/build affected).
ERROR: Nx/plugins fail -> nuke CheckNxPlugins OR FixNxPlugins -> re-verify; comprehensive: nuke VerifyWorkspace.

GLOBAL:
ALWAYS: plan 3-7 steps pre-edit; PR-sized diffs; respect Nx dep dir; narrowest build/tests/lint; show cmd+tail+exit; search patterns first (`rg` + codebase_search + nx-mcp) -> clone; verify after migrations/refactors.
DEBUG_HOST: ok stop running host/process to unblock build/test/debug; restart as needed.
NEVER: break Nx dep dir; skip verify after migrations/refactors; invent new patterns if canonical exists.
UNSURE: strategy=.agents/strategy.md; workspace map=.agents/workspace.manifest.json; playbooks=docs/AGENT_PLAYBOOKS.json; nx discovery via nx_workspace/nx_project_details; ask human w/ findings+options+safe default.

MCP:
QUICK: code search `rg` | codebase_search; docs: microsoft_docs (MS) + context7 (3rd-party); nx intel: nx-mcp; planning: manual 3-7 step plan; memory: read notes -> store durable learnings.
DOCS: microsoft_docs first for MS topics (canonical on conflict); context7 for Angular/Nx; mcp.context7 flow resolve-library-id -> get-library-docs.
NX: root must be client workspace; nx_docs for Nx Qs; nx_generators before codegen.

UI_DEBUG_PLAYWRIGHT (MANDATORY):
WHEN: UI render/interaction/visual/responsive/dynamic content/console errors/auth flows/forms/accessibility.
FLOW: navigate -> snapshot -> interact -> wait -> verify -> screenshot; always check console + screenshots before/after.
CLEANUP: reuse single tab; close tabs/contexts on finish or failed login.
E2E CFG: use appsettings.E2E.json (no env vars); disable auth blockers via appsettings.*.
E2E RUN: UI change -> run nx e2e affected (or project e2e target) when configured; include cmd + tail + exit.
TOOLS: browser_navigate; browser_snapshot (PRIMARY); browser_take_screenshot (MANDATORY); browser_console_messages; browser_click; browser_type; browser_press_key; browser_wait_for; browser_fill_form; browser_select_option; browser_drag; browser_network_requests; browser_evaluate; browser_resize; browser_tabs; browser_file_upload.

RIPGREP (MANDATORY):
- selector: `rg "selector:\s*'app-foo'" -t ts "src/{project}/client/src/" -C 2 -m 50`.
- imports: `rg "from '@eleon/" -t ts "src/{project}/client/src/" -C 1 -m 50`.

SHELL:
lint_frontend: `cd src\{project}\client; nx lint <project>` OR `nx run-many --target=lint --projects=<p1>,<p2>`.

ARCH:
NX layers: client-host -> client-mod -> client-lib; shared: client-lib; enforce aliases in tsconfig.base.json.

LANG:
typescript_angular: strict types; avoid any/unknown unless narrowed; DI + routing + Reactive Forms; no direct DOM; keep templates thin; preserve a11y.

FRONT_UI:
STACK: PrimeNG + Tailwind.
RULES: prefer PrimeNG components; Tailwind default for layout/spacing; avoid new global CSS; MF share PrimeNG/Angular singletons; verify webpack.config.ts after UI dep changes.
VERIFY UI: nx format:check; nx lint/test/build affected; if MF wiring touched, smoke host+remote.

OUTPUT:
Include nx format:check, lint/test/build (affected) tails + exit codes; add e2e when relevant.
