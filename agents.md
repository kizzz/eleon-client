InstructionsVersion: ae23262f-63f1-4787-a600-3cf04ff28e91

# FRONTEND AGENT SPEC

**Reference**: For general workspace rules, multi-repo coordination, and backend rules, see root [`agents.md`](../../../agents.md).

This document contains frontend-specific (Angular, Nx, Module Federation, PrimeNG, Tailwind) rules and patterns for the client directory.

## 0. CTX

ROLE:
- Angular/TS in Nx; components/services/modules/tests; enforce Nx boundaries + MF wiring

STACK:
- Angular + Nx + Module Federation (MF)

PATHS:
- frontend_root (Nx workspace root):
  - linux: /workspace/src/{eleonsoft|edi|immunities}/client
  - win:   C:\Workspace\src\{eleonsoft|edi|immunities}\client

CTX (must consult when relevant):
- .agents/nx-mcp-real-world-test.md
- root .agents/strategy.md (general strategy)
- root .agents/workspace.manifest.json

PD (consistency_over_cleverness):
- default: consistent, not clever
- if unsure: `rg` + codebase_search (semantic) → clone canonical → minimal delta

## 1. FRONTEND AGENT

FRONT:
- role: Angular/TS in Nx; components/services/modules/tests; enforce Nx boundaries + MF wiring
- tools:
  - mcp.nx_mcp.*;
- ctx: root .agents/workspace.manifest.json; root .agents/architecture.json (Nx)
- error handling:
  - Nx/plugins fail: nuke CheckNxPlugins (diagnose) OR nuke FixNxPlugins (install) → re-verify
  - comprehensive: nuke VerifyWorkspace
- flow:
  1) nx discovery: nx_workspace → nx_project_details <project> (before edits)
  2) inspect project.json + tsconfig.base.json aliases; if MF: webpack.config.ts remotes/exposes
  3) edits via typescript-semantic ops when helpful (rename/add member/etc)
  4) verify: nuke VerifyLint + nx affected (format/lint/test/build; e2e when relevant)

## 2. GLOBAL (Frontend-Specific)

ALWAYS:
- plan 3–7 steps BEFORE any edits (group by repo + layer)
- keep change PR-sized (few files; minimal surface area)
- respect Nx deps (one-way): client-host → client-module → client-lib
- run narrowest build/tests/lint that proves change (scoped/affected)
- show concrete tool results (commands + output tail + exit codes)
- search existing patterns first (`rg` + codebase_search + nx-mcp) → clone canonical → adapt
- verify after significant changes (MANDATORY after migrations/refactors)

NEVER:
- break Nx dependency direction
- skip verify loop after migrations/refactors
- invent new patterns when an existing canonical pattern exists

UNSURE:
- prefer tools over guessing:
  - strategy: root .agents/strategy.md
  - workspace map: root .agents/workspace.manifest.json
  - playbooks: root .agents/AGENT_PLAYBOOKS.json
  - Nx discovery: nx_workspace / nx_project_details before modify; nx_docs for Nx questions
- pattern workflow: `rg` + codebase_search (semantic) / nx-mcp discovery → clone canonical → minimal delta
- if architecture remains unclear: ask human (state what was found + options + safest default)

## 3. MCP (Frontend-Specific)

QUICK:
- code search: `rg` (ripgrep command-line tool, MANDATORY for text search) | codebase_search (semantic)
- docs: microsoft_docs (Microsoft stack) + context7 (3rd-party: Angular/Nx/etc)
- nx intel: nx-mcp (workspace/project graph/generators/CI hints)
- planning: manual 3–7 step plan (repo/layer scoped)
- memory: read workspace notes before; capture durable learnings after

DOCS (priority):
- microsoft_docs: Microsoft APIs/topics (canonical on conflicts)
- context7: Angular/Nx/NATS/MassTransit (docs+code)
- rule: call docs MCPs; do not guess APIs; keep excerpts minimal

mcp.microsoft_docs:
- endpoint: https://learn.microsoft.com/api/mcp
- stable + real-time; query specific APIs/topics (not whole products)
- rule: call before other docs for Microsoft topics; canonical if conflicts

mcp.context7:
- stable 3rd-party docs+code
- flow: resolve-library-id (fuzzy) → pick best ID → get-library-docs <id> [topic/page]
- selection: exact name match first; higher coverage/snippets; reputation High/Medium; prefer top-ranked
- id format: /org/project OR /org/project/version

mcp.nx_mcp (Nx + Angular):
- purpose: workspace metadata, project graph, generators, CI/CD hints
- root: src/{eleonsoft|edi|immunities}/client (linux) OR src\{eleonsoft|edi|immunities}\client (win)
- discovery flow:
  - nx show projects (CLI) OR nx_workspace (MCP)
  - nx show project <name> (CLI) OR nx_project_details (MCP)
- docs flow: nx_docs <query> (MCP) for Nx questions (don't assume)
- codegen: nx_generators (MCP) → nx generate @nx/angular:<gen> (or MCP generator)
- boundaries: check tsconfig.base.json aliases + project.json deps; respect Nx rules
- Module Federation:
  - hosts: module-federation-dev-server
  - remotes: exposes in webpack.config.ts
- examples: See `.agents/nx-mcp-real-world-test.md` in this directory

RIPGREP PATTERNS (MANDATORY - use `rg` command):
- Find Angular selector:
  - Pattern: `selector:\s*'app-foo'`
  - Scope: `*.ts` files under `client/src/**`
  - Example: `rg "selector:\s*'app-foo'" -t ts "src/eleonsoft/client/src/" -C 2 -m 50`
  - Windows PowerShell: `rg "selector:\s*'app-foo'" -t ts "src/eleonsoft/client/src/" -C 2 -m 50`
  - Use case: Finding Angular component selectors
- Find import statements:
  - Pattern: `from '@eleon/'`
  - Scope: `*.ts` files
  - Example: `rg "from '@eleon/" -t ts "src/eleonsoft/client/src/" -C 1 -m 50`
  - Windows PowerShell: `rg "from '@eleon/" -t ts "src/eleonsoft/client/src/" -C 1 -m 50`
  - Use case: Finding Nx path alias imports
- Find with exclusions: `rg "pattern" -t ts -g "!**/node_modules/**" -g "!**/dist/**" "client/src/" -C 2`

## 4. EXPLORATION (Frontend-Specific)

frontend-heavy → nx-mcp + Nx tools src/{eleonsoft|edi|immunities}/client (linux) OR src\{eleonsoft|edi|immunities}\client (win). planning: after discovery craft 3-7 step plan by repo/area shared/server/client; plans MUST name concrete paths (shared/contracts, server/modules, client/modules), only edit post plan.

## 5. SHELL (Frontend-Specific)

lint_frontend: linux: cd src/{eleonsoft|edi|immunities}/client && nx lint <project> | win: cd src\{eleonsoft|edi|immunities}\client && nx lint <project> | linux: cd src/{eleonsoft|edi|immunities}/client && nx run-many --target=lint --projects=<project1>,<project2> | win: cd src\{eleonsoft|edi|immunities}\client && nx run-many --target=lint --projects=<project1>,<project2>; ESLint via Nx (@nx/eslint:lint), use nx lint <project> not npm run eslint, Nx workspace src/{eleonsoft|edi|immunities}/client (linux) OR src\{eleonsoft|edi|immunities}\client (win), projects have lint targets project.json.

## 6. ARCH

NX: layers: client-lib, client-mod, client-host; allowed_deps: client-host → client-mod, client-lib | client-mod → client-lib | client-lib → no upward deps; paths: aliases @client/libs/*, @client/modules/*, @client/hosts/*, @shared/*, @vportal-ui/*, @eleoncore/*; rules: respect Nx boundaries, don't introduce illegal imports, shared UI/logic → libs, feature-specific logic → modules/apps.

## 7. LANG

typescript_angular: typescript: use strict types, avoid any/unknown unless immediately narrowed; use interfaces/types, unions, enums domain concepts; angular: keep templates simple, put logic TS/svc; use Angular DI, routing, Reactive Forms when present; avoid direct DOM APIs, prefer Angular abstractions; html_css: reuse design system/styles; keep CSS scoped, avoid new globals unless needed; preserve accessibility patterns where present.

## FRONT_UI (PrimeNG + Tailwind)

UI_STACK:
- component library: PrimeNG (Angular)
- styling: Tailwind CSS
- note: keep styling consistent with existing design system tokens/utilities; do not introduce new global CSS unless required

RULES:
- prefer PrimeNG components over custom widgets when a canonical component exists (tables, dialogs, forms, menus)
- Tailwind is the default for layout/spacing/typography; avoid bespoke CSS unless:
  - PrimeNG theme override requires it, OR
  - a reusable pattern is established in libs styles
- do not mix multiple competing styling systems (no new CSS frameworks; no ad-hoc inline styles beyond small exceptions)

NX + MODULE_FEDERATION:
- shared UI primitives belong in Nx libs (client-lib) to avoid duplication across remotes
- avoid importing PrimeNG modules piecemeal in many places with inconsistent versions/config
  - prefer a shared "ui" library/module that re-exports commonly used PrimeNG modules + shared directives/pipes
- ensure MF share configuration does not duplicate PrimeNG packages across host/remotes
  - treat `primeng`, `primeicons`, and Angular packages as shared singletons when MF config supports it
  - verify webpack.config.ts remotes/exposes after UI dependency changes

CODE_CONVENTIONS:
- Angular templates:
  - keep logic minimal; push decisions into TS/services
  - use Tailwind utility classes for structure; avoid large CSS blocks in component styles
- Forms:
  - prefer Reactive Forms; use PrimeNG form controls consistently
- Accessibility:
  - preserve ARIA/keyboard behavior; PrimeNG components already implement many a11y patterns—don't break them with custom markup

VERIFY (when UI changed):
- nx format:check
- nx lint affected
- nx test affected (if configured)
- nx build affected
- if MF wiring touched: run host + remote smoke check (basic navigation + component render)

## 11. OUTPUT

Angular Nx (required as applicable; include outputs):
- nx format:check + output tail + exit code
- nx lint affected + output tail + exit code
- nx test affected (if configured) + output tail + exit code
- nx build affected (or app build) + output tail + exit code
- nx e2e affected (when relevant) + output tail + exit code

NOTE:
- choose "affected" scope whenever possible; avoid full repo runs unless required
