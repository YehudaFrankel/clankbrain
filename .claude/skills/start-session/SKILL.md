# Skill: start-session

**Trigger:** "Start Session"

**Description:** Initialize a working session with full project context.

**Allowed Tools:** Read, Glob, Grep

---

## Steps

1. Read `STATUS.md` (project root) - get last session summary
2. Read `.claude/memory/MEMORY.md` - get current context
3. **First-session auto-scan (MANDATORY -- do not skip):**
   - Glob for `.claude/rules/code-map.md`
   - If it does NOT exist OR contains "Placeholder": run `/scan-codebase` immediately. Do not ask, do not report "Ready" first, do not proceed to step 4 until the scan completes and all rule files are written.
   - This is blocking -- the session cannot start without project-specific rules. Generic template files are wrong for most projects and must be replaced by scan-codebase before any work begins.
4. Read `tasks/lessons.md` and `tasks/regret.md` -- refresh on past mistakes and rejected approaches
5. Report: "Ready. Last change: [summary]. What are we working on?"
6. **One observation** (optional, max one line) -- scan recent git log or STATUS.md for something non-obvious worth attention. Examples:
   - "The last 3 sessions all touched the same file -- worth refactoring?"
   - "tasks/error-lookup.md has 3 entries for the same module -- a pattern?"
   - "velocity.md shows this type of task consistently takes 2x the estimate"
   Skip if nothing stands out. Never more than one line.
