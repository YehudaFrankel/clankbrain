# The Learning Loop: A Worked Example

**What this is:** Clankbrain can notice when one of its skills (a saved set of steps Claude follows) keeps failing at the same step, and then rewrite that step. This page walks through one example.

**Do you need it?** No. The loop runs through End Session and two commands, `/evolve-check` and `/evolve`. Read on to see what they do with your data.

**The example is illustrative.** The skill name, dates and endpoint names are made up to show the format. The file formats and flagging rules come from the kit's own `evolve-check` and `evolve` skills.

**Terms:**
- **Skill:** a file at `.claude/skills/<name>/SKILL.md` with numbered steps.
- **`/learn`:** runs at End Session and logs how each skill went.
- **`skill_scores.md`:** the log file (in `tasks/` in your memory folder) where results are recorded.

## The loop

1. At End Session, `/learn` adds a row to `skill_scores.md` for each skill you used: did it need a correction (Y) or not (N)?
2. `/evolve-check` reads the log and shows which skills keep failing. It changes nothing.
3. `/evolve` rewrites the failing step, using the logged failures.
4. `/evolve` records the fix in `tasks/skill_improvements.md` and marks those rows patched.
5. A later clean use confirms the fix.

## Step 1: Two failures at one step

A skill named `new-endpoint` fails twice at step 4:

```
| Date       | Skill        | Step   | Correction Needed | What Failed                                                    | Code Fixed | Skill Patched |
|------------|--------------|--------|-------------------|----------------------------------------------------------------|------------|---------------|
| 2024-11-21 | new-endpoint | step 4 | Y                 | Step 4: produced SELECT *, needed explicit column list.        | manual     | -             |
| 2024-12-03 | new-endpoint | step 4 | Y                 | Step 4: produced SELECT *, needed explicit column list.        | manual     | -             |
```

(The real file has more columns: Used For and Severity. They are left out here.)

- `Y` means you had to fix Claude's output.
- `Code Fixed = manual` means you fixed that code by hand.
- `Skill Patched = -` means the skill itself is not fixed yet, so the mistake can happen again.

## Step 2: `/evolve-check` flags it

A skill is URGENT with 3 or more unpatched failures, or 2 or more in a row at the same step. It is WATCH with exactly 2 unpatched failures. Sample output:

```
=== Evolve Check ===

🔴 URGENT - patch now
  new-endpoint - 2 open failures, 2 consecutive on Step 4
  Latest failure: "Step 4: produced SELECT *, needed explicit column list."

🟢 STABLE
  plan - 4 uses, 0 corrections
```

## Step 3: `/evolve` patches the step

`/evolve` patches only a skill with 2 or more failures, and only when each logged failure names a step and says what was produced and what was needed. It does not guess from vague entries. It rewrites the step that failed most often.

Before:

```markdown
### Step 4 - Build the query
Load the table structure with a SELECT.
  db.query("SELECT * FROM course_sessions WHERE 1=2");
```

After:

```markdown
### Step 4 - Build the query
Load the table structure with an EXPLICIT column list, never SELECT *.
SELECT * pulls in the auto-generated ID column, and the later insert fails.
  db.query("SELECT course_id, session_number, session_title FROM course_sessions WHERE 1=2");

[2024-12-10] Improved: replaced SELECT * example with an explicit column list.
```

## Step 4: The fix is recorded

`/evolve` adds a row to `tasks/skill_improvements.md` and changes `Skill Patched` from `-` to the date on the failed rows, so they no longer count as open.

```
| 2024-12-10 | new-endpoint | Step 4 | produced SELECT * | Rewrote example with explicit column list | skill_scores.md 2024-11-21, 2024-12-03 |
```

## Step 5: A clean use confirms it

The next `/evolve-check` shows the skill as patched but not yet proven:

```
🔵 PATCHED - awaiting confirmation
  new-endpoint - all Y entries patched on 2024-12-10, 0 uses since patch
  Next N score -> promote to STABLE
```

Weeks later you use the skill again and Claude gets step 4 right. `/learn` logs an N row, and the next `/evolve-check` shows the skill as STABLE.

## Habits that keep it working

1. **Run End Session every time.** `/learn` fills `skill_scores.md`. Skip it and there is nothing to learn from.
2. **Run `/evolve-check` when you want to see what needs attention.** It is read-only.
3. **Run `/evolve` when skills are flagged.**
