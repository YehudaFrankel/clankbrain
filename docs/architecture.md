# Architecture, Modes, and File Tree

This page explains how Clankbrain is built and what it installs. It is for people who want to understand or customize the kit. You do not need it to use the kit.

---

## In one paragraph

Clankbrain adds three things to a project. Memory files are plain text notes in `.claude/memory/` that Claude reads at the start of a session. Skills are saved instructions Claude follows when you type a command like `/learn`. Hooks are small scripts that Claude Code runs automatically at set moments (a session starting, a file being edited, a turn ending); they call `tools/memory.py` to keep the notes current. Claude Code reads `CLAUDE.md` and the memory index every session, so what was learned last time is there next time.

---

## The three layers

1. **Memory.** Notes that last across sessions: how the code is organized, decisions made, known bugs, rejected approaches. They live in your project, so git can carry them with the code.
2. **Skills.** Saved workflows. Each run is logged in `skill_scores.md` as worked or needed correction. `/evolve` rewrites the step that keeps failing. See [skills.md](skills.md).
3. **Automation.** Hooks and `tools/memory.py` check that notes match code, write a session journal, and save memory before a long conversation is shrunk.

---

## How the flow works

```
You type "Start Session"
   v
SessionStart hook --> memory.py --session-start (loads memory, checks health)
   v
Claude edits a file
   v
PostToolUse hook ---> memory.py --log-edit, --check-drift
   v
Claude finishes its turn
   v
Stop hook ----------> memory.py --process-corrections, --update-date,
                      --journal, --stop-check
```

When you correct Claude, the `UserPromptSubmit` hook saves the correction, and the `Stop` hook later turns it into a lesson. When a long conversation is shrunk ("compacted"), `PreCompact` and `PostCompact` save and restore memory.

---

## Full and Lite

| | Full | Lite |
|---|---|---|
| Memory files | Many: lessons, decisions, error lookup, critical notes, status, code references, preferences | Three: notes, lessons, decisions |
| Hooks and `tools/memory.py` | Yes (six hooks) | No |
| Drift checks and session journal | Automatic | No |
| Skills the installer copies | 19 core skills | 7 skills |
| Best for | Larger or long-running projects, teams | Small projects, quick start |

(Drift means your notes no longer match your code, for example after a function is renamed.)

Not sure? Start with Lite. To upgrade, run `python upgrade.py`. It downloads `tools/memory.py` and adds the hooks to `.claude/settings.json`. Your rules files stay. Restart Claude Code afterward.

---

## File tree (Full install)

```
your-project/
+-- CLAUDE.md               <- Instructions Claude reads every session
+-- STATUS.md               <- Session log: date and what changed
+-- update.py, upgrade.py   <- Kit updater and Lite-to-Full upgrade
+-- tools/memory.py         <- Everything the hooks run
+-- .claude/
    +-- settings.json       <- Hooks are written here
    +-- memory/
    |   +-- MEMORY.md       <- Index, loaded every session
    |   +-- lessons.md, decisions.md, error-lookup.md,
    |   |   critical-notes.md, agreed-flow.md, project_status.md
    |   +-- js_functions.md, html_css_reference.md, backend_reference.md
    |   +-- user_preferences.md
    |   +-- tasks/          <- skill_scores, skill_improvements, regret,
    |   |                      velocity, todo
    |   +-- plans/          <- _template.md and archive/
    +-- rules/              <- Fixed project rules, such as plan-before-edit
    +-- skills/             <- plan, learn, evolve, evolve-check, ...
```

An optional search index, `memory_embeddings.pkl`, is built by `memory.py --build-index`. Task files may sit in a top-level `tasks/` folder instead of `.claude/memory/tasks/`; the tool finds whichever exists. Commit `.claude/memory/` and `.claude/skills/` so they travel with the code.

---

## Updating the kit

Type `Update Kit` in Claude Code, or run `python update.py`. It shows what will change and asks first.

It never touches your memory files, your skills, your code, or anything below `## What This Project Is` in `CLAUDE.md`. It does update the commands block in `CLAUDE.md`, `setup.py`, and `tools/memory.py`.

To update from a fork:

```
python update.py https://github.com/user/repo
```
