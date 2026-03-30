---
name: debug-session
description: Structured debugging flow for any bug or unexpected behavior. Follows reproduce → isolate → hypothesize → fix → verify → log. Ends by updating error-lookup.md so the same bug never costs time again. Triggers on "debug session", "can't figure out why", "weird behavior", "something's wrong with", "why is X not working", "help me debug".
model: claude-sonnet-4-5
effort: high
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
---

# Skill: debug-session

**Trigger:** `"debug session"` · `"can't figure out why"` · `"weird behavior"` · `"something's wrong with"` · `"why is X not working"` · `"help me debug"`

---

## Steps

### Step 1 — Check error-lookup.md first
Before any investigation:
- Read `.claude/memory/error-lookup.md`
- Keyword-match the described symptom against known entries
- If a match is found: surface it immediately — "This matches a known error. Known cause: [X]. Known fix: [Y]. Try this first before investigating further."
- If no match: proceed to Step 2

### Step 2 — Reproduce
Establish the exact conditions that trigger the bug:
- What exact input / action causes it?
- What is the expected behavior?
- What is the actual behavior (exact error message, wrong output, or missing behavior)?
- Is it consistent or intermittent?

Write a one-sentence bug statement: *"When [X], [Y] happens instead of [Z]."*

Do not guess at the cause yet.

### Step 3 — Isolate
Narrow the blast radius before reading code:
- Which layer is it in — frontend, backend, DB, config, network?
- Does it reproduce in a minimal case (no other factors)?
- When did it last work? What changed since then?

Use Grep and Read to find the relevant code path — don't read entire files.
List every file that could be responsible. Cross off files that aren't.

### Step 4 — Hypothesize
State 2–3 specific hypotheses ranked by likelihood:
1. Most likely: [specific thing that could cause this exact symptom]
2. Less likely: [alternative]
3. Edge case: [if neither of above]

For each hypothesis: what evidence would confirm or rule it out?

### Step 5 — Fix
Pick the most likely hypothesis. Apply the minimal fix — change only what the hypothesis requires.

Follow `plan-before-edit.md` format: show Before/After, state why this will work.

### Step 6 — Verify
After the fix:
- Does the original symptom reproduce? (it should not)
- Does anything adjacent break? (run Guard Check or smoke test if available)
- Is the fix consistent, or does it only work sometimes?

If verification fails — return to Step 4 with the new information. Do not stack additional fixes on top of a failing one.

### Step 7 — Log it
**Always do this, even if the fix took 2 minutes.**

Add an entry to `.claude/memory/error-lookup.md`:

| Error message / symptom | Cause | Fix |
|---|---|---|
| [exact symptom from Step 2] | [root cause from Step 4] | [what was changed in Step 5] |

Then check: is this a pattern that belongs in `regret.md` (rejected approach) or `guard-patterns.md` (recurring class of mistake)?

---

## Closing message
"Bug fixed. Root cause: [X]. Fix: [Y]. Logged to error-lookup.md. [N] minutes this costs next time: 0."

## Auto-Chain
- **After Step 5 (fix applied):** automatically invoke `verification-loop` — do not wait for user to ask. Run it immediately.
- **On verification failure:** loop back to Step 4 with updated hypotheses — do not escalate until 2 hypotheses have been ruled out
- **After Step 7:** if this is the second time the same type of bug appeared → add a guard to `guard-patterns.md`; if 3+ bugs share a pattern, say `Generate Guards` to build project-specific guards from the full error history
