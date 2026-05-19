---
name: progress-report
keep-coding-instructions: true
---

# Skill: progress-report

**Trigger:** "progress report", "how am I doing", "show my progress", "is this working", "what has the kit done for me"

**Description:** Shows concrete numbers proving the system is compounding. Run after session 5 or any time the user wants to see the value.

**Allowed Tools:** Read, Grep

---

## Steps

1. **Read these files and count:**

   - `lessons.md` — count `## ` headings = lessons accumulated
   - `tasks/regret.md` — count `## ` or `|` table rows = rejected approaches permanently blocked
   - `error-lookup.md` — count `## ` or `|` table rows = known errors never debugged twice
   - `tasks/skill_scores.md` — count N rows vs Y rows = skill success rate
   - `STATUS.md` — extract session number = sessions logged

2. **Format the report:**

```
=== Clankbrain Progress Report ===

  Sessions logged          [N]
  Lessons accumulated      [N]   ← patterns Claude applies every session
  Rejected approaches      [N]   ← bad ideas permanently blocked
  Known errors logged      [N]   ← bugs never debugged twice
  Skill accuracy           [N]%  ← N / (N + Y) from skill_scores.md

  [One of these based on session count:]
  → Session 1-5:  "Early days. The system is learning your codebase."
  → Session 6-15: "Compounding has started. Keep the End Session habit."
  → Session 16-30: "The system knows your patterns. Regret guard is active."
  → Session 30+:  "Deep compounding. Claude knows your codebase better than most teammates would."

  Biggest win so far: [pick the most specific/interesting lesson from lessons.md]
  Approaching: [pick any skill with 2+ Y scores — next /evolve will patch it]
```

3. **Surface the next action:**
   - If sessions < 5: "Keep going — the compounding becomes visible around session 10."
   - If any skill has 2+ Y scores: "Run `/evolve` — [skill] has failed twice and is ready to patch."
   - If regret.md has 0 entries: "Add your first rejected approach to regret.md — it's the highest-leverage thing you can do."
   - If lessons.md has 0 entries: "Run `/learn` at the end of your next session — nothing compounds without extraction."

---

## Notes

- Auto-suggest this skill at Start Session when session number crosses 5, 10, 20, 50
- Keep the report short — the goal is to make compounding visible, not overwhelming
- The "biggest win" line is the most motivating part — make it specific and concrete
