# Clankbrain Cheat Sheet

A one-page list of what to type in Claude Code. It is for anyone using Clankbrain who wants a quick reminder. Commands that start with `/` are **skills**: saved sets of steps Claude follows. Commands without a slash are plain phrases you type.

---

## Every day

| Type | What happens |
|---|---|
| `Start Session` | Claude reads its notes and tells you where you left off |
| `End Session` | Claude saves lessons and updates the session log |
| `/plan task` | Claude makes a plan before changing anything |
| `/recall topic` | Claude searches its notes for what you already know about a topic |
| `/learn` | Claude pulls lessons out of the current conversation |

## First time in a project

| Type | What happens |
|---|---|
| `scan-conventions` | Claude reads your code and writes down your coding style |
| `map-codebase` | Claude writes a map of your files and functions |

Run each once.

## When something seems wrong

| Type | Use it when |
|---|---|
| `tour` | You want a guided walkthrough |
| `kit-health` | You want to check the install worked |
| `Check Drift` | Claude's notes may be out of date compared with your code |
| `Update Kit` | You want the latest version of Clankbrain |
| `progress report` | You want counts of sessions, lessons, and so on |

## Handing a project to someone

| Type | What happens |
|---|---|
| `Handoff` | Claude writes `HANDOFF.md`: current state, next tasks, decisions, known problems |

---

## Where things are

| What | Where |
|---|---|
| Project instructions for Claude | `CLAUDE.md` |
| Claude's notes (memory files) | `.claude/memory/` |
| Skills | `.claude/skills/` |
| Rules for your project | `.claude/rules/` |
| Lessons, decisions, rejected ideas | `tasks/` (or `.claude/memory/tasks/` if you set up with `memory.py --init`) |
| Session log | `STATUS.md` |

You rarely need to open these. Claude reads and writes them.

## If you get stuck

1. Type `tour`.
2. Read [QUICKSTART.md](QUICKSTART.md).
3. Check you typed `Start Session` at the start and `End Session` at the end. Most problems come from skipping one.
