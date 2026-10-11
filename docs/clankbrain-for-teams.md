# Clankbrain for Teams

**What this is:** A guide to using Clankbrain with a group. It shows how teammates can share what they learn, such as bug fixes, settled decisions and rejected ideas, so nobody repeats the same work.

**Do you need it?** Only if two or more people work on the same codebase with Claude Code. If you work alone, read the [README](../README.md) instead.

**Terms used here:**
- **Memory files** are plain text files (markdown) that Clankbrain keeps in `.claude/memory/`. Claude reads them at the start of each session.
- **Start Session** and **End Session** are commands you type in Claude Code. The first loads memory. The second saves what you learned.
- **Shared memory** means a few of those files, copied through a private GitHub repository (an online folder only your team can see) that everyone connects to.

---

## The problem

Knowledge stays in one person's head or one chat. Three examples:

- One developer spends hours on an odd error and fixes it. A teammate hits the same error next week and spends the same hours.
- The team settles a design debate. A new person joins later and reopens it.
- Someone learns that an approach fails in your setup. Everyone else learns it by trying it.

With shared memory, the fix, the decision and the failed approach are written down once. Every teammate's Claude reads them at the start of each session.

---

## What is shared and what is not

Each person has their own Clankbrain setup. Personal files stay on that person's computer. A set of team files is shared. The full list of files, and how merging works, is in [sync.md](sync.md#team-sync).

Shared files include `decisions.md` (settled choices), `regret.md` (rejected approaches), `error-lookup.md` (errors and fixes), `lessons.md` and `critical-notes.md`.

Not shared: `velocity.md`, `skill_scores.md`, `user_preferences.md`, `session_journal.md` and `todo.md`.

Sharing only adds new table rows. It never edits or deletes rows you already have.

---

## What this looks like in practice

### A bug is fixed once

Developer A fixes an error and logs the cause in `error-lookup.md` during End Session. A runs `Team Push`. Developer B's next Start Session pulls the new entry. When B sees that error, the fix is already in memory.

### A rejected idea stays rejected

The team logs a failed approach in `regret.md`. A hook (a script Claude Code runs for you) checks each prompt against that file and warns when a prompt matches an entry. This works for new teammates too, once they have joined.

### A decision is written down

The reason for a design choice goes into `decisions.md`. Claude reads it at Start Session and warns when a plan seems to contradict it.

### A new person gets up to speed

1. They install Clankbrain and run `Join Team`.
2. They type `Handoff`. Claude writes `HANDOFF.md`, a summary of the current state, the next tasks, key decisions, known bugs and how to start.

This is only as good as what the team has recorded. A shared memory with few entries gives a short summary.

---

## Rolling it out

1. **Week 1: one person, one project.** Pick one active developer. They run `npx clankbrain` and choose Full. They use Start Session and End Session all week, so there is real content to share.
2. **Week 2: connect the team.** That person creates a private repo, then runs `Setup Team: <repo URL>`. Each teammate runs `Join Team: <repo URL>` once and answers `y` when asked to merge. Steps are in [sync.md](sync.md#team-sync).
3. **After that, two habits.**
   - Start Session pulls shared memory by itself.
   - End Session, then `Team Push`, shares your updates.

---

## The catch

Sharing only works if people run End Session and `Team Push`. If someone skips them, the team loses what that person learned. The team lead should help the habit take hold in the first weeks.

To keep skills sharp, you can also run `/evolve-check` now and then. It only reads your skill records and shows which skills keep failing. It changes nothing. When it flags a skill, run `/evolve` to patch it. See [loop-proof.md](loop-proof.md) for an example.

---

## Get started

```
npx clankbrain
```

Needs Python 3.7 or newer and Node.js. Choose Full. Then follow [sync.md](sync.md#team-sync) to connect your team.

Source: [github.com/YehudaFrankel/clankbrain](https://github.com/YehudaFrankel/clankbrain)
