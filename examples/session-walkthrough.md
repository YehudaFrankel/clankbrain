# Session Walkthrough — Start to Finish

A real session from a production project. Shows every command, what fires, and what Claude does at each step.

---

## Starting a session

**You type:** `Start Session`

**What fires:**
- `SessionStart` hook runs `memory.py --session-start`
- Loads `MEMORY.md`, reads `STATUS.md`, checks for stale memory files
- Applies any lessons from `lessons.md` that haven't been internalized yet

**Claude responds:**
```
Ready. Last change: Added messages field to dash state object (session 139).
What are we working on?
```

---

## Making a change

**You say:** `the dashboard isn't showing the message count badge`

**What Claude does (plan-before-edit rule):**

1. Greps the codebase — finds `renderMessagePeek` at `DashboardFunctions.js:600`, confirms the line
2. Reads the relevant section to understand current behavior
3. Shows a plan:

```
Problem: renderMessagePeek reads dash.messages but the badge
count div is never updated when messages load.

Related functions:
- renderMessagePeek — DashboardFunctions.js:600 ✓ (verified)
- retLoadDashboard  — DashboardFunctions.js:141 ✓ (verified)

Before:
  renderMessagePeek(messages);

After:
  dash.messages = messages;
  renderMessagePeek(messages);

Why: dash.messages is never populated on load — renderMessagePeek
reads a stale empty array on re-renders. Assigning first fixes it.

Scope: 1 file · 1 line · logic change · affects message badge only
Rollback: git restore DashboardFunctions.js
```

**You say:** `yes`

**Claude edits the file.**

**PostToolUse hook fires:**
```
Code was edited (DashboardFunctions.js). Step 3 of plan-before-edit:
read back the changed lines and confirm they match your plan After block.
Report ✓ Verified:[file]:[lines] or flag any mismatch immediately.
```

**Claude reads back lines 141-145, reports:**
```
✓ Verified: DashboardFunctions.js:143 matches plan.
```

---

## Mid-session: context getting long

**Stop hook fires after a long exchange:**
```
Context at 68% — consider /compact soon.
```

**You type:** `/compact`

**PreCompact hook fires** — surfaces memory checklist so nothing is lost through compaction.

**PostCompact hook fires** — re-injects `MEMORY.md` so the session resumes warm.

---

## Ending a session

**You type:** `End Session`

**What Claude does:**

1. Runs `/learn` — scans the conversation for patterns, corrections, and decisions
2. Writes new entries to `lessons.md` and `decisions.md` if anything worth keeping was discovered
3. Updates `STATUS.md` — increments session number, one-line summary of what changed
4. Updates `currentDate` in `MEMORY.md`

**Stop hook fires:**
- `--process-corrections` — applies any captured corrections from the session
- `--journal` — writes a timestamped session summary to `session_journal.md`
- `--stop-check` — checks for unsaved memory, open plans, context warnings

**Claude reports:**
```
Session complete. Lessons saved. STATUS.md updated (session 140).
Memory pushed.
```

---

## If something goes wrong mid-session

**You say:** `undo`

Claude runs the rollback command from the plan:
```
git restore DashboardFunctions.js
```
Reads back the file, confirms it's restored, reports:
```
Reverted. DashboardFunctions.js restored to pre-edit state.
```

---

## Key things to notice

- **Memory loads automatically** — you don't tell Claude what the project is
- **Plans validate before showing** — function references are grepped, not guessed
- **Verification fires automatically** — the hook reminds Claude after every edit
- **Undo is one word** — no manual git commands needed
- **Lessons persist** — corrections from this session apply next session without re-explaining
