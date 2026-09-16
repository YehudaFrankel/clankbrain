# Skill: end-session

**Trigger:** "End Session"

**Description:** Save session progress, extract lessons, update memory, push to GitHub if configured.

**Allowed Tools:** Read, Edit, Write, Glob, Grep, Bash

---

## Steps

1. **Extract lessons** (`/learn`):
   - Review conversation for bugs fixed, patterns discovered, decisions made
   - Check which memory layout exists: `.claude/memory/lessons.md` or `tasks/lessons.md`
   - Append lessons and decisions to whichever files exist

2. **Update error-lookup** (`tasks/error-lookup.md`):
   - If any runtime errors were solved this session, add them: Symptom | Root Cause | Fix
   - Skip if no errors were encountered

3. **Update regret log** (`tasks/regret.md`):
   - If any approach was tried and discarded this session, log it with why it was rejected
   - Skip if nothing was rejected

4. **Evolve check** (`/evolve-check` if available):
   - Scan `tasks/skill_scores.md` for skills that needed corrections
   - Report which skills are healthy vs need attention
   - Skip if skill_scores.md is empty

5. **Update STATUS.md** (project root):
   - Increment session number
   - Add one-line summary of what changed

6. **Update MEMORY.md** (`.claude/memory/MEMORY.md`):
   - Set `currentDate` to today's date and session number

7. **Update skill_usage.md** (`tasks/skill_usage.md`):
   - Log which skills fired this session with today's date

8. **Plan drift check**:
   - Glob `plans/` for files marked "Ready to Code" or "In Progress"
   - If output files exist, update plan status to `SHIPPED`

9. **Update velocity** (`tasks/velocity.md`):
   - If any planned task was completed this session, log estimated vs actual sessions
   - Skip if no planned tasks were completed

10. **Push memory** (if memory.ps1 exists in project root):
    ```
    powershell -NoProfile -ExecutionPolicy Bypass -File memory.ps1 push
    ```
    Skip silently if memory.ps1 doesn't exist.

11. **Report**:
    ```
    Session complete.

    **Session N** -- [one-line summary]
    **Lessons extracted:** N
    - [one line per lesson]
    **Errors logged:** N (or "none")
    **Regrets logged:** N (or "none")
    **Files touched:** [list]
    ```
