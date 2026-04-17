---
name: prototype-hypothesis
description: Force a one-line hypothesis before any prototype iteration. Prevents "learning theater" — building things that demo well but don't reduce risk. Triggers on "iterate on the prototype", "let me try", "tweak the design", "change the [color/layout/copy]", "what if we", or any prototype edit in build-to-learn mode.
allowed-tools: Read, Write, Edit
---

# Skill: prototype-hypothesis

## Trigger
Use when about to make any change to a prototype file (HTML, CSS, JS in mobile/Keep* or similar discovery work) without an obvious bug fix.

Common phrases that trigger:
- "let me try changing X"
- "iterate on the prototype"
- "what if we"
- "tweak the [color/spacing/copy]"
- "make the X more [adjective]"

## What this skill does

Before any prototype change, force the user to answer 4 questions in one line each. If they cannot answer, the change is not an experiment — it's noise.

## The 4 questions

1. **What question does this change answer?**
   Example: "Does prominent green pricing make non-tech users trust the payment form?"
   Bad: "Make the page nicer."

2. **What result tells us yes?**
   Example: "User clicks Pay without asking 'is this safe?'"
   Bad: "It looks better."

3. **What result tells us no?**
   Example: "User hesitates or asks if the page is legitimate."
   Bad: "We didn't like it."

4. **Which user narrative is this for?** (if narratives exist for this project)
   Example: "Carol — she's making a $360 dedication and needs to feel safe."
   Bad: "Everyone."

## How to use

When triggered, respond with the 4 questions. Wait for answers. Then:

- If answers are concrete → log to `[MEM]/tasks/prototype_log.md` with date + change + hypothesis + result-when-tested
- If answers are vague ("looks better", "feels nicer") → push back: "That's a preference, not a hypothesis. What specific user behavior would change?"
- If user can't answer → suggest: "Skip this iteration. Either find a real hypothesis or do something else."

## Log format

Append to `[MEM]/tasks/prototype_log.md`:

```
| Date | Change | Hypothesis | Result | Verdict |
|------|--------|------------|--------|---------|
| 2026-04-16 | Made Pay button green | Increases trust for non-tech users | Carol clicked without asking | KEEP |
```

## Why this exists

The user's own commentary on the Cagan article identified "learning theater" as the failure mode of build-to-learn:
> "PMs cranking out prototypes that generate motion and demo well but don't actually reduce risk because the PM doesn't know what question the prototype is supposed to answer."

This skill is the mechanical defense against that failure mode. It forces the question before the change, not after.

## When NOT to use

- Bug fixes (no hypothesis needed — the bug IS the question)
- Build-to-earn mode (use plan-before-edit instead)
- Following an explicit step in a build plan (the plan is the hypothesis)
- Cosmetic changes the user has explicitly approved with no need for testing

## Related

- `build-mode.md` — defines when this skill applies (build-to-learn mode only)
- `combine-plans.md` — for delivery work, plans replace hypotheses
- `product-risk` — runs the four-risks evaluation; hypothesis-skill runs per-iteration
