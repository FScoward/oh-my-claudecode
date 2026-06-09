# oh-my-claudecode v4.14.6: $TMPDIR transcript dogfood, Japanese keyword routing, team dispatch hardening

## Release Notes

Patch release with **1 new feature**, **8 bug fixes**, and **3 hardening/quality updates** across the post-`v4.14.5` dev line.

### Highlights

- **fix(transcript): honor `$TMPDIR` in transcript path validation; align worktree test encoding with Claude dot encoding** (#3230)
- **feat(keyword-detector): Japanese keyword routing for 7 more skills + KO/JA docs** (#3218)
- **fix(team): surface substantive task output when finals are terse** (#3224)
- **fix(team): only stamp dispatch cooldowns on successful delivery** (#3227)
- **fix(ask): pipe long/multiline/frontmatter prompts to Claude via stdin** (#3223)

### New Features

- **feat(keyword-detector): Japanese keyword routing for 7 more skills + KO/JA docs** (#3218)

### Bug Fixes

- **fix(transcript): honor `$TMPDIR` in path validation; align test encoding with Claude's dot encoding** (#3230)
- **fix(team): surface substantive task output when finals are terse** (#3224)
- **fix(team): only stamp dispatch cooldowns on successful delivery** (#3227)
- **fix(team): exclude harness files from worktree auto-merge** (#3226)
- **fix(team): validate `N:agent:role` specs instead of silently collapsing to Claude** (#3225)
- **fix(ask): pipe long/multiline/frontmatter prompts to Claude via stdin** (#3223)
- **fix(notifications): honor proxy env for Telegram**
- **fix(notifications): dispatch session-idle from plugin Stop hook**
- **fix(subagents): suppress SubagentStop context reinjection**
- **fix: ignore stale plugin root for update notices** (#3214)

### Quality & Hardening

- **Ensure advisory agents return substantive findings** (#3217)
- **Fix SubagentStop tracker output loop** (#3204)
- **test: tolerate minor CI subagent lock jitter** (#3205)

### Stats

- **12 PR-linked updates** | **1 new feature** | **8+ bug fixes** | **3 hardening/quality updates**

### Install / Update

```bash
npm install -g oh-my-claude-sisyphus@4.14.6
```

Or reinstall the plugin:
```bash
claude /install-plugin oh-my-claudecode
```

**Full Changelog**: https://github.com/Yeachan-Heo/oh-my-claudecode/compare/v4.14.5...v4.14.6

## Contributors

Thank you to all contributors who made this release possible!

@Yeachan-Heo
