# The Learning Loop in Practice — A Real Case Study

This is a real example from 160 sessions on a Java/SQL production codebase.
The skill is `new-endpoint`. It failed at the same step twice. `/evolve` patched it.

---

## What the data looks like after two failures

**`tasks/skill_scores.md` (excerpt):**

```
| Date       | Skill        | Step   | Used For                          | Correction Needed | Severity | What Failed                                                                               | Code Fixed | Skill Patched |
|------------|--------------|--------|-----------------------------------|-------------------|----------|-------------------------------------------------------------------------------------------|------------|---------------|
| 2024-11-14 | new-endpoint | all    | Add appCourseGetCheckin endpoint  | N                 | minor    | -                                                                                         | -          | -             |
| 2024-11-21 | new-endpoint | step 4 | Add appAdminSendReminder endpoint | Y                 | major    | Step 4: produced SELECT * in getOnlyMetaData, needed explicit column list. Fixed by: rewrote SELECT with all columns named. | manual | - |
| 2024-12-03 | new-endpoint | step 4 | Add appAdminGetMessages endpoint  | Y                 | major    | Step 4: produced SELECT * in getOnlyMetaData, needed explicit column list. Fixed by: rewrote SELECT with all columns named. | manual | - |
| 2024-12-09 | new-endpoint | step 6 | Add appCourseMarkComplete endpoint| N                 | minor    | -                                                                                         | -          | -             |
```

Two Y entries. Same step. Same failure. `Code Fixed = manual` means the code was corrected at the time. `Skill Patched = -` means the SKILL.md hasn't been improved yet — the same mistake will happen again. That's the signal.

---

## What /evolve-check surfaces

```
/evolve-check

Skill Health Report
───────────────────────────────────────

🔴 URGENT — new-endpoint
   2 failures at step 4 — same issue twice
   Step 4: SELECT * in getOnlyMetaData → IDENTITY column included → addRow fails
   Ready to patch.

🟢 STABLE — plan
   4 uses, 0 corrections

🟢 STABLE — learn
   6 uses, 1 minor correction (different steps each time — noise, not pattern)

🟡 WATCH — smoke-test
   1 failure at step 2 — too early to patch (need 2+ failures at same step)
```

Takes 5 seconds. No files changed.

---

## What /evolve does with the data

It reads the two Y entries for `new-endpoint`. Both say "Step 4: produced SELECT *, needed explicit column list."

It opens the skill and finds Step 4. Before patching:

```markdown
### Step 4 — Build the UTable query

Use getOnlyMetaData with a SELECT to load the table structure.

Example:
  t.getOnlyMetaData("SELECT * FROM ch_CourseSession WHERE 1=2");
```

After patching:

```markdown
### Step 4 — Build the UTable query

Use getOnlyMetaData with an EXPLICIT column list — never SELECT *.
SELECT * pulls IDENTITY columns into metadata → addRow tries to INSERT
an explicit PK value → SQL Server error.

Example:
  t.getOnlyMetaData("SELECT CourseID, SessionNumber, SessionTitle,
    SessionContent, CreatedOn, OrganizationID FROM ch_CourseSession WHERE 1=2");

⚠ Pattern from 2 failures (2024-11-21, 2024-12-03):
  Always list every column except the IDENTITY PK explicitly.
```

It also writes to `tasks/skill_improvements.md`:

```
| 2024-12-10 | new-endpoint | step 4 | 2 failures (same step) | Rewrote example: SELECT * → explicit column list. Added identity column warning. | skill_scores.md rows 2024-11-21, 2024-12-03 |
```

And updates `skill_scores.md` — the two Y rows now have `Skill Patched = 2024-12-10`:

```
| Date       | Skill        | Step   | Used For                          | Correction Needed | Severity | What Failed                             | Code Fixed | Skill Patched |
|------------|--------------|--------|-----------------------------------|-------------------|----------|-----------------------------------------|------------|---------------|
| 2024-11-21 | new-endpoint | step 4 | Add appAdminSendReminder endpoint | Y                 | major    | Step 4: produced SELECT *... Fixed by:… | manual     | 2024-12-10    |
| 2024-12-03 | new-endpoint | step 4 | Add appAdminGetMessages endpoint  | Y                 | major    | Step 4: produced SELECT *... Fixed by:… | manual     | 2024-12-10    |
```

---

## Verifying the patch held — the full cycle

After /evolve patches the skill, the next /evolve-check shows:

```
🔵 PATCHED — awaiting confirmation
  new-endpoint — all Y entries patched on 2024-12-10, 0 uses since patch
  Next N score → promote to 🟢 STABLE
```

The skill isn't 🟢 STABLE yet — it's patched but unverified. It needs a real use that goes clean.

**Session 7 weeks later.** Adding a new endpoint. The skill fires.

Step 4 now shows the explicit column example and the warning. Claude writes the correct query first time. No correction needed. /learn logs an N entry:

```
| 2025-01-28 | new-endpoint | all | Add appCourseGetReminders endpoint | N | minor | - | - | - |
```

Next /evolve-check:

```
🟢 STABLE — new-endpoint
  5 uses, 1 clean use since patch on 2024-12-10. Failure has not repeated.
```

**That's the complete cycle.** Failure → structured log → /evolve patches the skill → /evolve-check shows 🔵 PATCHED → real use confirms fix → 🟢 STABLE.

---

## The compound effect by session 30

After 30 sessions on the same codebase:

- `new-endpoint` patched 2 times — Step 4 (identity column) and Step 6 (noCheckSessionFunc array)
- `fix-bug` patched 1 time — Step 3 (hypothesis before grep, not after)
- `learn` patched 0 times — still stable
- `smoke-test` patched 1 time — Step 2 (check Resin log before testing endpoint)

A generic skill becomes a skill that knows your stack's specific failure modes.

---

## The three habits that make it compound

1. **End Session every time** — `/learn` gathers the data. Skip it and the loop breaks.
2. **Run `/evolve-check` when you want to know what needs attention** — takes 5 seconds, read-only.
3. **Run `/evolve` when skills are flagged** — patches the specific steps with real failure data behind every change.

That's the whole system.
