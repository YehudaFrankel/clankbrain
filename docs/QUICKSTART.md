# Quickstart: Your First 3 Sessions

This page walks you through your first three work sessions after installing Clankbrain. It is for anyone who has just run the installer and wants to know what to do next. No coding-tool experience beyond Claude Code is needed.

A "session" here means one sitting of work in Claude Code, from opening it to closing it.

---

## How it works in one minute

Claude Code forgets everything when you close it. Clankbrain fixes that with plain text files, called **memory files**, that Claude reads at the start of each session and updates at the end. You control this with two phrases you type into Claude Code:

- `Start Session` - Claude reads its notes and tells you where you left off.
- `End Session` - Claude saves what it learned.

Session 1 will feel like normal Claude, because the notes are empty. That is expected. The benefit grows as the notes fill up.

---

## Session 1: Fill the notes for the first time

1. Open Claude Code in your project and type:
   ```
   Start Session
   ```
   Claude looks over your project and sets up its notes. It then asks what you are working on.
2. Describe your project in a few sentences, then do some normal work.
3. When you are done, type:
   ```
   End Session
   ```
4. Claude asks: "What are three things about this codebase I should never forget?" Answer with anything that tends to trip up an AI assistant, such as rules, quirks, or patterns specific to your project. If you have nothing yet, type "nothing yet."

Your answers go into `lessons.md`, a file of short tips that Claude reads at every later `Start Session`. `STATUS.md` (a one-line log per session) is also updated.

## Session 2: See it remember

1. Type `Start Session`. Claude reports what changed last time and applies your lessons. You do not need to re-explain your project.
2. Work normally. If something breaks, ask Claude to diagnose it.
3. Type `End Session`.

## Session 3: Check how your skills are doing

A **skill** is a saved set of step-by-step instructions that Claude follows for a task, such as fixing a bug. Skills live in `.claude/skills/`.

1. Work normally, then type `End Session`.
2. At the end, Claude may run `/evolve-check`, which reports which skills have needed corrections. You might see lines like:
   ```
   🟢 STABLE - learn: 3 clean sessions
   🟡 WATCH - plan: 1 correction logged
   ```
   Green means no problems. Yellow means a skill has needed a correction. If one skill is corrected twice, type `/evolve` to have Claude improve its steps.

---

## Which command do I use?

| I want to... | Type |
|---|---|
| Begin work | `Start Session` |
| Plan a change before making it | `/plan` |
| Look up what we already decided | `/recall topic` |
| Fix a bug | `/fix-bug` |
| Save lessons mid-session | `/learn` |
| See which skills need fixing | `/evolve-check` |
| Improve a skill that keeps failing | `/evolve` |
| Finish and save | `End Session` |

## The two habits that matter

1. **Always run `End Session`.** Without it, nothing is saved.
2. **Run `/evolve` when `/evolve-check` flags a skill.** Otherwise the same mistakes repeat.

---

## Keep reading

- [How the learning loop works, with examples](loop-proof.md)
- [Every command](commands.md)
- [How skills improve](skills.md)
