# What Clankbrain Does and Why

Clankbrain is a kit that gives Claude Code a memory. This page explains the problem it solves and how it works, for people who have not used it yet. No background is needed beyond knowing what Claude Code is.

---

## The problem

Claude Code starts every session with a blank slate. It does not remember what you built yesterday, the bug you spent hours fixing, a decision you settled, or an idea you tried and dropped.

So each session you re-explain your project, and Claude may suggest the same rejected idea again. Clankbrain fixes this by keeping notes in files and loading them at the start of each session.

## The idea

Clankbrain stores notes in plain text files inside your project. These are called **memory files**. Claude reads them at the start of a session and updates them at the end. It uses Claude Code's own extension points, called **hooks**: small scripts Claude Code runs automatically at certain moments, like session start or after a file edit. It runs on your computer and needs no API keys. Setup takes a few minutes.

---

## The two commands

### Start Session

Type `Start Session` in Claude Code. Claude reads its notes, reports where you left off, and applies lessons from earlier sessions.

- Before: you spend several minutes re-explaining the project.
- After: Claude tells you the last change and asks what you want to do.

### End Session

Type `End Session` when you finish. Claude pulls lessons out of the session, updates the session log (`STATUS.md`), and saves its notes. If you set up memory syncing, it also pushes them to your own git repository. Next time, `Start Session` loads all of it.

---

## What the memory files do

| File | What it holds | Why it helps |
|---|---|---|
| `lessons.md` | Tips learned from past sessions | Claude applies them before you repeat a mistake |
| `decisions.md` | Choices you settled, with reasons | Claude stops re-opening settled questions |
| `error-lookup.md` | Past errors with their root cause and fix | You do not debug the same error twice |
| `regret.md` | Approaches you tried and rejected, with reasons | Claude is told to check it before planning, so it does not suggest them again |
| `velocity.md` | Estimated versus actual time for past tasks | Claude can base estimates on your real pace |

**Drift detection.** If code changes but the notes do not, Claude's picture of your project goes stale. A hook runs after Claude edits a file and flags notes that no longer match. Run `Check Drift` to check by hand.

**Global lessons.** `~/.claude/global-lessons.md` holds tips that apply to every project, such as "check `.env` before debugging login problems."

**Handoff.** Type `Handoff` and Claude writes `HANDOFF.md`: current state, next tasks, settled decisions, and known problems. It helps a new teammate catch up.

---

## The learning loop

A skill is a saved set of steps Claude follows for a task, such as `/fix-bug`. Clankbrain tracks how each skill does:

1. After a session, `/learn` records which skills worked and where any failed.
2. `/evolve-check` reads those records and lists skills that need attention. It changes nothing.
3. `/evolve` rewrites the steps that failed more than once.

One failure does not trigger a rewrite. Repeated failures at the same step do.

---

## What to expect

- **First few sessions:** the notes are mostly empty, so it feels like normal Claude. That is expected.
- **After several sessions:** lessons and decisions start to apply, and you explain less.
- **Over time:** skills are adjusted by your own feedback.

How much you gain depends on how consistently you use it.

## Three habits

1. **Run `End Session` every time.** Without it, nothing is saved.
2. **Run `/evolve-check` now and then** to see which skills need work.
3. **Run `/evolve` when a skill is flagged.** Skills do not rewrite themselves.

---

## Getting started

1. In your project folder, run:
   ```
   npx clankbrain
   ```
   You need Node and Python 3.7+. You can choose Lite (three memory files, no hooks, a smaller set of skills) or Full (all memory files, hooks, and more skills). You can upgrade from Lite to Full later.
2. Open Claude Code and type `Start Session`. Claude scans your project and builds its first notes.
3. Do some normal work.
4. Type `End Session`. Read what Claude saved.
5. Next session, type `Start Session` again and notice what you did not have to explain.
6. After about five sessions, type `progress report` to see counts of lessons, known errors, and skill results.

For a step-by-step plan, see [QUICKSTART.md](QUICKSTART.md) and [FIRST5.md](FIRST5.md).

Clankbrain sends a small anonymous usage report (random ID, version, mode, operating system, Python version) at setup and session start. Your code and memory files are not sent. To turn it off, set `CLANKBRAIN_NO_TELEMETRY=1`. See the [FAQ](faq.md).

---

Built by Yehuda Frankel. [github.com/YehudaFrankel/clankbrain](https://github.com/YehudaFrankel/clankbrain)
