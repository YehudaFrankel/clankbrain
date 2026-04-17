---
name: parallel-prototypes
description: Run 2-3 prototype variants of a UX decision in parallel instead of iterating sequentially. Cagan calls this the "freshest observation" enabled by AI tooling. Triggers on "should it be X or Y", "two approaches", "I'm torn between", "try both", "parallel prototypes", "compare designs", "A/B this".
allowed-tools: Read, Write, Edit, Bash
---

# Skill: parallel-prototypes

## Trigger
Use when the user is debating between 2-3 approaches to the same problem and would normally pick one to try first.

Common phrases:
- "should it be X or Y"
- "I'm torn between A and B"
- "should we try the modal or the slide-out?"
- "purple button or green?" (only if it's actually a hypothesis worth testing — see prototype-hypothesis skill)
- "let me try the WhatsApp style first" (push back: "Let's try 3 styles in parallel")

## What this skill does

Instead of picking one approach to iterate on, build 2-3 versions of the same screen/component side-by-side. Then evaluate them against the same hypothesis at the same time.

This works because AI prototyping costs are now so low that building 3 variants takes ~30% more time than building 1, but eliminates the sequential iteration cycle.

## When to use

Use when:
- The decision affects user behavior (UX layout, copy, payment flow, onboarding)
- The right answer isn't obvious from existing patterns
- You can articulate the hypothesis the variants will test
- The cost of building each variant is under ~20 minutes

DO NOT use when:
- One approach is clearly correct from prior decisions (decisions.md)
- The decision is technical, not user-facing (use the right architecture, don't A/B it)
- You haven't run `prototype-hypothesis` first — variants without a hypothesis = 3x learning theater

## How to run it

1. **State the hypothesis** — what are all variants testing for?
2. **Define the variants** — 2 or 3 approaches that genuinely differ on the variable being tested
3. **Build each as a separate file** — e.g., `KeepAliveNowApp_v1.html`, `_v2.html`, `_v3.html` — same structure, different on the tested variable
4. **Test against the same user/narrative** — Carol uses all 3, you watch what happens
5. **Pick the winner** — log result to `prototype_log.md`, delete the losers
6. **Iterate sequentially on the winner** — parallel exploration is for the macro decision; refinement is sequential

## Example

**Hypothesis:** Where should the "Honor someone" CTA live to maximize the rate of dedications?

**Variants:**
- v1: Persistent ❤ button in compose bar
- v2: Subtle text link below feed ("Want to honor someone?")
- v3: First-row card always at top of feed

**Test:** Carol opens each version. Where does she click first when thinking of Patricia?

**Result:** v2 wins because Carol said "I don't want a button shouting at me. The link feels like a friend tapping me on the shoulder."

**Action:** Delete v1 and v3. Iterate on v2 if needed.

## Why this exists

From Cagan's article (the user's own article saved in memory):
> "Today it's not unusual to quickly create several prototypes each exploring several different approaches to solving the problem, that we can then test simultaneously, and then continue to improve the most promising sequentially."

The user iterated KeepAliveNow sequentially through 10 sessions of UX revision. Some of those 10 sessions could have been compressed into 2-3 parallel-prototype sessions if the macro decisions had been tested in parallel. The cost of NOT doing parallel exploration is more discovery sessions than necessary.

## Related

- `prototype-hypothesis` — required before any variant gets built
- `build-mode.md` — only applies in build-to-learn mode
- `product-risk` — the four-risks evaluation runs at the project level; parallel-prototypes runs at the decision level

## Cleanup

After picking a winner:
- Delete losing variant files immediately
- Don't keep them "just in case" — they become noise
- Log to `prototype_log.md` with the hypothesis + variants + winner + reason

The losers are valuable as evidence, not as code. Keep the evidence in the log, not the codebase.
