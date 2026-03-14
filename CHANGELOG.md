# oh-my-claudecode v4.8.0: Tracer Agent, Security Hardening & HUD Token Tracking

## Release Notes

Major release introducing the **Tracer agent** for evidence-driven causal analysis, comprehensive **security vulnerability patching** (21 CVEs), **HUD real-time token usage tracking**, and **team governance hardening** backported from OMX runtime.

### Highlights

- **Tracer Agent & Trace Skill** — New evidence-driven causal tracing agent with competing hypotheses, evidence ranking, and discriminating probe recommendations. Enables systematic root-cause analysis with scientific rigor. (#1568)
- **Security Hardening** — Patches 21 security vulnerabilities including SSRF bypass, command injection, prototype pollution, and shell injection vectors. (#1558)
- **HUD Token Usage Tracking** — Real-time token usage display in HUD with optional transcript token totals for better cost visibility. (#1589, #1592)
- **OMX Team Governance Backport** — Hardened team runtime with leader nudge guidance, governance enforcement, and improved pane stall heuristics. (#1584)
- **Unified MCP Registry** — Synchronized MCP registry now syncs to Codex config for consistent server management. (#1579)

### New Features

- **feat(trace): add tracer agent and trace skill** — Evidence-driven causal tracing with hypothesis ranking, evidence for/against tracking, and uncertainty quantification. (#1568)
- **feat(hud): add optional transcript token totals** — Real-time token usage tracking in HUD status line. (#1589, #1592)
- **feat(setup): sync unified MCP registry to codex config** — Centralized MCP server management across configurations. (#1579)
- **feat(lsp): add Verilog/SystemVerilog support via verible-verilog-ls** — Hardware description language support. (#1551)
- **feat(team): add governance enforcement and leader nudge guidance** — Structured team governance with policy enforcement. (#1584)

### Security Fixes

- **fix(security): patch 21 security vulnerabilities and logic bugs** — Comprehensive security audit addressing:
  - SSRF guard bypass via IPv6-mapped IPv4 addresses
  - Command injection in tmux launchCmd
  - Prototype pollution in deepMerge
  - Shell injection in tsc-runner
  - Shared state mutation in magic-keywords
  - Task file rollback race conditions
  - And 15 additional security and logic issues (#1558)

### Bug Fixes

- **fix(hooks): preserve Windows hook paths with spaces** — Correctly handles hook paths containing spaces on Windows. (#1602, #1603)
- **fix(hooks): unblock ExitPlanMode in high-context flows** — Resolves context safety issues during ExitPlanMode. (#1597, #1598)
- **fix(notifications): use nullish coalescing for parseInt fallback** — More robust notification reply configuration. (#1596)
- **fix(team): sync codex worker startup with task lifecycle** — Prevents race conditions in worker initialization. (#1593, #1594)
- **fix(hooks): deactivate ultrawork state on max reinforcements** — Proper cleanup of mission state on session end. (#1591)
- **fix(windows): harden omc-setup HUD statusline flow** — Windows-specific HUD improvements. (#1586)
- **fix(skill-state): default unknown skills to no protection** — Safer defaults for unregistered skills. (#1582)
- **fix(team): remove double shell-escaping of env vars** — Fixes environment variable handling in worker spawn. (#1580)
- **fix(team): clean stale team runtime state after team clear** — Prevents state leakage between team sessions. (#1577)
- **fix(setup): preserve canonical CLAUDE markers** — Maintains CLAUDE.md integrity during setup. (#1574)
- **fix(team): harden pane stall heuristics** — Better detection of stuck team worker panes. (#1566)
- **fix(hud): keep skill statusLine guidance portable** — Cross-platform status line improvements. (#1562)
- **fix(update): resolve Windows reconcile binary via omc.cmd** — Windows update path fixes. (#1560)
- **fix(hooks): skip stop-hook protection for non-OMC skills** — Prevents interference with native Claude Code commands. (#1559)
- **fix(hooks): use correct npm package name in session-start update check** — Fixes update check module resolution. (#1556)

### Documentation

- **docs(trace): harden tracer evidence protocol** — Documented evidence hierarchy and disconfirmation rules. (#1576)
- **docs: update CLAUDE.md and REFERENCE.md** — Synchronized documentation with new agent and skill additions. (#1568)

### Stats

- **23+ PRs merged** | **21 security fixes** | **6 new features** | **1 new agent**

### Install / Update

```bash
npm install -g oh-my-claude-sisyphus@4.8.0
```

Or reinstall the plugin:
```bash
claude /install-plugin oh-my-claudecode
```

**Full Changelog**: https://github.com/Yeachan-Heo/oh-my-claudecode/compare/v4.7.10...v4.8.0

---

# oh-my-claudecode v4.7.10: Bedrock Model Routing, Team Runtime Hardening & Session History Search

## Release Notes

Release focused on Bedrock model routing fixes, team runtime hardening ported from OMX, session history search capabilities, and various reliability improvements across the CLI, HUD, and agent delegation systems.

### Highlights

- **Bedrock Model Routing Fix** — Normalizes explicit model IDs in all code paths, preventing `claude-sonnet-4-6` style IDs from leaking to the API and causing 400 errors. (#1415, #1548)
- **Team Runtime Hardening** — Ports startup hardening from OMX requiring real work-start evidence before settling startup; stops treating ACK-only leader-mailbox replies as sufficient. (#1540, #1547)
- **Session History Search** — New `omc session search` command to search through prior local session history with filters and full-text search. (#1545, #1546)
- **Lazy Agent Loading** — Reduces startup memory by loading agent prompts on-demand rather than eagerly. (#1495, #1497)

### Features

- **feat(session): add session history search** — Full-text search across session history with filters for mode, date range, and status. (#1545, #1546)
- **feat(ralph): add critic selection for verification** — Allows selecting critic agent for verification workflows. (#1496, #1498)
- **feat(openclaw): normalize native clawhip signals** — Standardizes signal handling between OpenClaw and Claude Code. (#1500, #1503)
- **feat(doc-specialist): add first-pass context hub guidance** — Improves documentation specialist with context hub awareness. (#1519)
- **feat: add skill pipeline handoff metadata** — Metadata support for skill-to-skill handoffs. (#1520)

### Bug Fixes

- **fix(routing): normalize explicit model IDs in all code paths** — Fixes Bedrock routing where full model IDs leaked through; extracts `normalizeToCcAlias()` helper and applies it to `enforceModel()` and `buildLaunchArgs()`. (#1415, #1548)
- **fix(team): require real startup evidence** — Stops treating ACK-only leader-mailbox replies as sufficient startup evidence; requires task claim ownership or worker status progress. (#1540, #1547)
- **fix(team): resolve worktree mailbox trigger paths** — Fixes worktree path resolution for mailbox triggers. (#1535, #1539)
- **fix(team): finish runtime hardening port** — Completes OMX runtime hardening backport for team stability. (#1535, #1537)
- **fix(hud): avoid repeated watch mode initialization** — Prevents duplicate watch initialization that could cause high CPU usage. (#1543, #1544)
- **fix(hud): reduce transient usage API retry hammering** — Reduces aggressive retry behavior on API failures. (#1513)
- **fix(hud): preserve stale usage limits on API failures** — Maintains last-known limits when API is unavailable. (#1507, #1508)
- **fix(hooks): add missing continue: false to persistent-mode.cjs Stop hook** — Ensures stop hook properly blocks. (#1517)
- **fix(skill): harden omc-teams tmux and agent validation** — Strengthens validation for team tmux sessions. (#1491, #1492)
- **fix(delegation): skip legacy agent sync when plugin agents exist** — Prevents unnecessary sync operations. (#1499, #1501)
- **fix(doctor): accept supported omc config keys** — Expands doctor to recognize all valid configuration keys. (#1502, #1504)
- **fix(team): clean up stale transient files on session end** — Removes orphaned transient files after sessions. (#1510, #1511)

### Refactor & Documentation

- **refactor: lazy agent loading** — Loads agent prompts on-demand to reduce startup memory footprint. (#1495, #1497)
- **docs: fix outdated install references in REFERENCE.md** — Removes stale analytics references. (#1533, #1536)
- **docs: remove stale analytics references** — Cleans up documentation. (#1538)
- **revert: undo unauthorized rebrand PRs 1527-1529** — Reverts unauthorized naming changes. (#1532)
- **chore: remove stale root development artifacts** — Cleans up repository root. (#1526)

### Stats

- **20+ PRs merged** | **15+ bug fixes** | **5+ new features**

### Install / Update

```bash
npm install -g oh-my-claude-sisyphus@4.7.9
```

Or reinstall the plugin:
```bash
claude /install-plugin oh-my-claudecode
```

**Full Changelog**: https://github.com/Yeachan-Heo/oh-my-claudecode/compare/v4.7.8...v4.7.9

---

# oh-my-claudecode v4.7.8: Stop-Hook Hardening & CLI Reliability Fixes

## Release Notes

Patch release focused on post-v4.7.7 stabilization on `dev`: stop-hook hardening, agent consolidation follow-up, LSP/session cleanup, and reliability fixes across routing, notifications, HUD polling, wait-state handling, ask-skill session behavior, status line portability, and fish-shell worker launches.

### Highlights

- **Stop-hook hardening for persistent flows** — Adds standalone protection for `team` and `ralplan`, fixes false-blocking after skill completion, and extends protection coverage to `deep-interview`. (#1424, #1432, #1435)
- **Agent consolidation follow-up** — Consolidates 4 overlapping agent pairs (22→18 agents), removes 5 thin wrapper skills, and adds benchmark coverage for all 4 consolidated agents to make prompt tuning measurable. (#1425, #1426, #1437)
- **Runtime cleanup and stability** — Cleans session-scoped mode state on exit and force-kills orphaned LSP server processes when the MCP bridge shuts down. (#1428, #1429)
- **CLI and environment reliability** — Preserves `ask-codex` / `ask-gemini` behavior inside Claude Code sessions, makes `statusLine` paths portable across machines, and fixes Team worker pane launch commands for Fish shell users. (#1438, #1404, #1377)

### Bug Fixes

- **fix(platform): replace win32 hard-blocks with tmux capability checks** — Removes platform-level hard denial in favor of capability detection so supported Windows environments can proceed when tmux interoperability is available. (#1423)
- **fix(stop-hook): add hard-blocking for standalone team and ralplan** — Adds first-class protection paths for standalone Team and Ralplan flows to prevent premature interruption of long-running orchestration. (#1424)
- **fix(session-end): clean session-scoped mode state on exit** — Ensures session-local state is removed when execution ends so stale mode markers do not leak into later sessions. (#1428)
- **fix(lsp): kill orphaned LSP server processes on MCP bridge exit** — Terminates managed child language servers during bridge shutdown to prevent orphan buildup and memory pressure. (#1429)
- **fix(routing): respect env-configured Claude family models** — Keeps runtime model selection aligned with environment overrides instead of falling back to stale defaults. (#1430)
- **fix(notifications): pass tmuxTailLines config to formatter parseTmuxTail** — Makes notification tail rendering honor the configured tmux line limit end to end. (#1431)
- **fix(hud): reduce usage API polling to avoid 429s** — Lowers polling pressure and improves stale-cache behavior under rate limiting. (#1418)
- **fix(wait): handle stale cached rate limit status** — Prevents misleading wait-state behavior when cached rate-limit data has expired. (#1433)
- **fix: preserve ask-codex and ask-gemini inside Claude Code sessions** — Keeps ask-skill flows working correctly when invoked from inside Claude Code sessions instead of losing behavior to session context drift. (#1438)
- **fix: use portable $HOME path in statusLine for multi-machine sync** — Replaces machine-specific status line paths with a portable home-based path better suited for synced dotfiles and multi-machine setups. (#1404)
- **fix(team): support fish shell in worker pane launch commands** — Corrects Team worker pane launch behavior for Fish shell environments. (#1377)

### Refactor & Testing

- **refactor(skills): eliminate 5 thin wrapper skills + CLAUDE.md diet** — Removes redundant thin wrappers and trims docs to reduce maintenance overhead. (#1425)
- **refactor(agents): consolidate 4 overlapping agent pairs (22→18 agents)** — Simplifies the registry while preserving compatibility aliases and downstream routing behavior. (#1426)
- **test(skill-state): align ralplan expectations with stop-hook** — Updates test expectations to match the hardened stop-hook enforcement model. (#1435)
- **feat(benchmarks): add per-agent prompt benchmark suite for all 4 consolidated agents** — Extends prompt benchmarking infrastructure so merged agents can be compared against archived pre-consolidation prompts. (#1437)

### Build

- **fix(release): add marketplace.json and docs/CLAUDE.md to version checklist** — Closes the release-process gap that allowed version drift in non-package metadata files.
