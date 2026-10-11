# Your First 5 Sessions

This is a short plan for your first five work sessions with Clankbrain. It is for new users who want to build the habits that make the memory useful. One session means one real block of work in Claude Code, not five in one day.

Two terms used below: **memory files** are plain text files where Claude keeps notes about your project, and a **skill** is a saved set of steps Claude follows for a task (for example `/plan` or `/fix-bug`).

---

## Session 1: Check the install

1. Type `kit-health`. It checks that the kit's parts are in place and shows what passed.
2. Type `tour`. This is a short guided walkthrough. Follow the prompts.
3. Do 20-30 minutes of real work.
4. Type `End Session`.

Look at what End Session saved. At least one lesson should be written to a memory file, and Claude will read it next time on its own.

## Session 2: Plan before you build

1. Type `Start Session`. Claude reports what changed last time.
2. Pick a task you were going to do anyway.
3. Type `/plan` followed by the task name, for example `/plan add a login page`.
4. Read the plan. It includes a section that argues against your approach, which is meant to catch problems early.
5. If it looks right, say "yes" and let Claude do the work.
6. Type `End Session`.

## Session 3: Log a rejected idea

`tasks/regret.md` is a list of approaches you tried and dropped, with the reason. Claude is told to check it before making plans, so it does not suggest the same idea again.

1. Type `Start Session`.
2. Work as usual. When something you try fails, tell Claude to add it to `tasks/regret.md`, with the reason it failed.
3. Type `End Session`.

(If your project was set up with `python tools/memory.py --init`, this file is at `.claude/memory/tasks/regret.md`.)

## Session 4: Check your skills

1. Type `Start Session`.
2. Use at least two skills, such as `/fix-bug`, `/code-review`, or `/plan`.
3. Type `End Session`. If a skill got something wrong, say so, and be specific ("it skipped the test step"). Specific notes lead to better fixes than vague ones. `/learn` records how each skill went.

These notes are saved in `tasks/skill_scores.md`. Later, `/evolve-check` reads it, and `/evolve` improves skills that keep failing.

## Session 5: Look at the results

1. Type `Start Session`. Claude now loads several lessons.
2. Work as usual.
3. Before ending, type `progress report`. It shows counts of sessions, lessons, known errors, and skill results.
4. Type `End Session`.

---

## After session 5

- Every session: `Start Session`, work, `End Session`.
- Every few sessions: `/evolve-check`, then `/evolve` for any skill it flags.
- Any time: `progress report`.

See also: [all commands](commands.md) and [the FAQ](faq.md).
