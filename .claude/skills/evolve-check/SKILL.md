# Skill: evolve-check

**Trigger:** "evolve check", "check evolve", "which skills need evolving", "evolve status", "skill health"

**Description:** Reads skill_scores.md and surfaces which skills are ready for /evolve. Analysis only — no patching, no file changes.

**Allowed Tools:** Read, Glob

---

## Steps

1. **Read `tasks/skill_scores.md`** — load all data rows. If the table is empty, report:
   "No skill scores logged yet. Run /learn at the end of sessions to populate skill_scores.md."
   Then stop.

2. **Group by skill name.** For each skill compute:
   - Total fires (all rows for this skill)
   - **Unpatched Y count** — Y rows where `Skill Patched = -` (not yet fixed by /evolve)
   - **Patched Y count** — Y rows where `Skill Patched != -` (already fixed by /evolve)
   - N count (Correction Needed = N)
   - Consecutive unpatched Y streak — count from the most recent row backwards until an N or a patched-Y is hit
   - Whether any unpatched Y entries have "INSUFFICIENT DATA" or vague "What Failed" (no step number)

   **Important:** Only unpatched Y entries (`Skill Patched = -`) count toward URGENT/WATCH thresholds. Patched entries are resolved — they don't count as open failures.

3. **Classify each skill:**
   - 🔴 **URGENT** — 3+ unpatched Y scores, OR 2+ consecutive unpatched Y scores on the same step
   - 🟡 **WATCH** — exactly 2 unpatched Y scores (threshold met, ready for /evolve)
   - 🔵 **PATCHED** — has Y entries but ALL have `Skill Patched != -`; skill was fixed but not yet confirmed stable
   - 🟢 **STABLE** — 0 or 1 unpatched Y score, or 10+ consecutive N scores (includes post-patch N scores)
   - ⚠️ **DATA MISSING** — has unpatched Y entries but "What Failed" is vague or marked INSUFFICIENT DATA

4. **Output the report:**

   ```
   === Evolve Check ===

   🔴 URGENT — patch now
     [skill] — [unpatched Y count] open failures, [streak] consecutive on Step [N]
     Latest failure: "[verbatim What Failed entry]"

   🟡 WATCH — ready for /evolve
     [skill] — 2 open Y entries ([dates])
     Failures: Step [N] / Step [N]

   🔵 PATCHED — awaiting confirmation
     [skill] — all Y entries patched on [date], [N] uses since patch
     Next N score → promote to 🟢 STABLE

   🟢 STABLE
     [skill] — [N count] clean sessions

   ⚠️ DATA MISSING — cannot evolve yet
     [skill] — Y logged but "What Failed" too vague to patch
     Action: next failure, log as: Step [N]: produced [X], needed [Y]. Fixed by [Z].

   ---
   [N] skills flagged (🔴/🟡 only — 🔵 PATCHED are resolved pending confirmation).
   Run /evolve on flagged skills now? [y/N]
   ```

5. **Stop.** Do not patch anything. Do not modify any files. Do not call /evolve automatically.

---

## Notes

- This is a read-only diagnostic — it surfaces signals, never acts on them
- Run at End Session to catch urgent skills before the session closes
- /evolve does the actual patching — this just tells you when to run it
- A skill with alternating Y/N is not stable — the previous fix didn't hold; flag it manually
