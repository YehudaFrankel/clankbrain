# Clankbrain: Kit Overview

A quick map of the files in the kit and what each one does. It is for anyone who wants the big picture before digging in. Version 2.12.1.

Three terms used below:

- **Memory files**: plain text files where Claude keeps notes about your project.
- **Hook**: a small script Claude Code runs automatically at certain moments, such as when a session starts.
- **Skill**: saved instructions Claude follows when you type a short command like `/learn`.

---

## Files in the kit

| File | What it is for |
|------|----------------|
| `setup.py` | First-time setup. Asks about your project, creates the files, writes the hooks. |
| `tools/memory.py` | The script the hooks call. Checks notes, writes the journal, searches memory. |
| `update.py` | Updates the kit without touching your memory or skills. |
| `upgrade.py` | Upgrades a Lite install to Full. |
| `install.py` | Small bootstrapper that downloads the kit on the first install. |
| `sync.py` | Optional memory sync to your own private repo, and optional team sharing. |
| `CLAUDE.md` | Instructions Claude reads every session, including `Start Session` and `End Session`. |

---

## Full and Lite

| | Full | Lite |
|---|---|---|
| Memory files | Many (see below), plus tasks and plans | Three: `notes.md`, `lessons.md`, `decisions.md` |
| Hooks and `tools/memory.py` | Yes | No |
| Skills the installer copies | 19 core skills | 7 skills |
| Upgrade later | | `python upgrade.py` |

Not sure which to pick? Start with Lite.

---

## What `tools/memory.py` does

The hooks run it for you. The main options:

| Option | Runs | What it does |
|--------|------|--------------|
| `--session-start` | Session opens | Checks that memory is healthy |
| `--check-drift` | After an edit | Finds code your notes do not mention yet |
| `--journal` | Claude finishes a turn | Writes a short session summary |
| `--stop-check` | Claude finishes a turn | Reminds you to save memory, shows open plans |
| `--precompact` / `--postcompact` | Around a conversation shrink | Saves and restores memory |
| `--bootstrap` | Once, by hand | Scans a new project and builds a quick index |
| `--complexity-scan` | First session | Detects your stack and suggests skills |

The full list is at the top of `tools/memory.py`.

---

## Memory files (Full install)

Most live in `.claude/memory/`:

| File | What it holds |
|------|---------------|
| `MEMORY.md` | Index of all memory files, loaded every session |
| `lessons.md` | Lessons saved by `/learn` |
| `decisions.md` | Settled choices, so they are not argued again |
| `project_status.md` | What is built and in progress |
| `js_functions.md`, `html_css_reference.md`, `backend_reference.md` | Your functions, page parts, and endpoints |
| `user_preferences.md` | How you like Claude to work |
| `tasks/skill_scores.md` | Log of when each skill worked or failed |
| `tasks/regret.md` | Rejected approaches, so they are not suggested again |
| `tasks/velocity.md` | Estimated versus actual time per task |
| `plans/_template.md` | Plan template, one file per feature |

Task files and plans may sit in top-level `tasks/` and `plans/` folders instead. The tool finds whichever exists.

---

## Hooks

The installer writes six hooks into `.claude/settings.json`: `SessionStart` (a session opens), `UserPromptSubmit` (you send a message), `PostToolUse` (after an edit), `PreCompact` and `PostCompact` (around a conversation shrink), and `Stop` (Claude finishes a turn). See [hooks.md](hooks.md).

---

## Skills

The kit holds 36 skills. Examples: `plan`, `learn`, `evolve`, `evolve-check`, `search-first`, `fix-bug`, `verification-loop`, `strategic-compact`. See [skills.md](skills.md).

---

## A normal day

```
Start Session   ->  memory is loaded; Claude reports the last change
[work]
/evolve-check   ->  optional: see which skills need fixing
End Session     ->  lessons saved, STATUS.md updated
/evolve         ->  only if /evolve-check flagged a skill
```

Type `Start Session` and `End Session` as normal messages in Claude Code.
