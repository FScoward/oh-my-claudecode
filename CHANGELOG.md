# oh-my-claudecode v4.13.1: Cursor Support & Bug Fixes

## Release Notes

Release with **1 new feature**, **2 bug fixes** across **3 merged PRs**.

### Highlights

- **feat(team): Add cursor-agent as 4th tmux worker type** (#2736) - Cursor agent support in `omc-teams` CLI execution
- **fix(keyword-detector): Stop false-positive autopilot on "autonomous"** (#2739) - "autonomous" no longer triggers autopilot mode
- **fix(self-improve): Scope artifacts by topic for safer resumes** (#2732) - Topic-scoped artifact directories prevent cross-contamination

### New Features

- **feat(team): Add cursor-agent as 4th tmux worker type (executor-only)** (#2736)
  - Cursor IDE agent support alongside Claude, Codex, and Gemini workers
  - Runtime-guidance test compatibility preserved

### Bug Fixes

- **fix(keyword-detector): Stop false-positive autopilot on "autonomous"** (#2739)
- **fix(self-improve): Scope self-improve artifacts by topic for safer resumes** (#2732)

### Stats

- **3 PRs merged** | **1 new feature** | **2 bug fixes** | **0 security/hardening improvements** | **0 other changes**

---

# oh-my-claudecode v4.13.0: Bug Fixes

## Release Notes

Release with **2 bug fixes**, **2 other changes** across **4 merged PRs**.

### Highlights

- **fix(installer): Copy hooks lib modules during update** (#2728)
- **fix(hooks, windows): pass shell:true to plugin-patterns npm/npx spawns** (#2722)

### Bug Fixes

- **fix(installer): Copy hooks lib modules during update** (#2728)
- **fix(hooks, windows): pass shell:true to plugin-patterns npm/npx spawns** (#2722)

### Other Changes

- **Reland: autoresearch-as-a-skill migration (fixes conflicts vs #2716)** (#2727)
- **Fix deep-interview threshold on native skill path** (#2724)

### Stats

- **4 PRs merged** | **0 new features** | **2 bug fixes** | **0 security/hardening improvements** | **2 other changes**
