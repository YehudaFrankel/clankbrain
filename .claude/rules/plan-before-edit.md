# Plan Before Edit — Required for All Code Changes

Before making ANY edit to code files, you MUST stop and present a plan. Do NOT apply edits until the user explicitly says to proceed.

**Does NOT apply to:** memory files, `.claude/` rules/skills/settings files.

---

## Step 0 — Regret Check (silent)

Before showing any plan, grep `regret.md` for keywords matching the proposed approach:
- **No match → proceed silently.** Do not mention the check.
- **Match found → surface it prominently before showing the plan:**
  > ⚠ This approach is in regret.md: [entry title] — [why it was rejected]. Proposing alternative below.

**Maintenance rule:** When adding a new entry to `regret.md`, check if it has occurred 2+ times. If yes, promote it to `regret-top.md` immediately. Never let `regret-top.md` drift.

---

## Step 1 — Validate Before Showing the Plan

Before presenting the plan, verify every function reference:
- Use Grep or Read to confirm each listed function exists at the stated line number
- Never show a plan with unverified function references — a wrong line number means you read the wrong code

---

## Required Plan Format

### Problem / Feature
One clear sentence: what is broken or what needs to be added.

### All Related Functions
List every function touched — including callers, callees. Verified against codebase before showing.

### Before (relevant lines only)
```
// the current code that will change
```

### After
```
// the replacement code
```

### Why this will work
One sentence explaining the mechanism — not just "this fixes it" but WHY.

### Scope / Blast Radius
- **Files touched:** every file that will change
- **Lines changed:** exact count from Before/After above
- **Type:** Logic change | Refactor (no behavior change) | Config/data only
- **Affected at runtime:** what breaks if this goes wrong

### Evaluation
- **Strong points:** what makes this approach solid
- **Risks:** concrete things that could go wrong, each with a mitigation
- **Confidence:** High | Medium | Low
- **Verdict:** Proceed | Hold (need more info) | Redesign (approach is wrong)

### Challenge (devil's advocate — mandatory)
State the strongest argument AGAINST this approach in one or two sentences. Not a risk (what could go wrong) — a challenge is "why this might be the wrong approach entirely."

Examples:
- "A skeptical engineer would ask why we're adding a new endpoint when the existing one could be extended."
- "The real problem might be upstream — fixing here treats the symptom."
- "This adds complexity to a method that's already long — the right move might be extracting first."

If no credible challenge exists, write: "No credible alternative — this is the only sensible approach because [reason]."

**This section exists so the user can catch a wrong approach before any code changes.**

### Rollback
```
git restore path/to/file.ext
```

---

## Step 2 — Wait for Approval

Show the plan. Wait for "yes", "go ahead", "do it", or equivalent. Only then edit.

**The rapid-iteration trap:** During fast-paced UI work, the temptation is to skip the plan because changes "feel small." This is exactly when the rule matters most — small unplanned edits compound into broken states.

---

## Step 3 — Verify After Every Edit

After applying each edit:
1. Read back the changed lines
2. Show the user the actual lines — quote the content, not a summary
3. Confirm it matches the After block

---

## Lock Rules Before Large Refactors

Before any change touching more than ~100 lines or 3+ files, ask:
> "Any additional conventions to apply before I start? I'll bake them all in one pass. Reply 'all locked' or list them."

---

## Undo Command

If the user says **"undo"**: run `git restore path/to/file.ext`, read back the lines, confirm restored.
