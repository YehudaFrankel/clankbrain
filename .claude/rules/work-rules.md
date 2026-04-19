---
description: Core behavioral rules — search-first, verify-before-done, stop-on-unexpected
---

# Work Rules — Behavioral Guardrails for Every Session

These rules apply to every task, every session, without exception.
They exist because the most common mistakes are process failures, not knowledge failures.

---

## Search Before Coding
Before writing any new function, endpoint, or component:
- Grep the codebase for existing implementations of the same thing
- Check `decisions.md` — has this approach already been decided?
- Check `tasks/regret.md` — has this approach already been rejected?

Never implement something that already exists. Never re-propose something already rejected.

## Cross-Reference Before Marking Done
Before reporting a task as complete:
- Read back the actual changed lines — not a summary, the content
- Confirm the change matches what was asked, not just what was planned
- If the change touches a shared utility or referenced function, check callers

"Done" means verified, not just written.

## Stop on Unexpected Behavior
If anything surprising happens mid-task — an unexpected error, a result that doesn't match expectations, a file that looks different than expected:
- **Stop immediately**
- Report what was found before continuing
- Do not work around it silently

Unexpected behavior is information. Routing around it without reporting it hides bugs.

## Never Assume Silence Means Success
A command that returns no output is not confirmed as successful.
After any Bash command, write, or edit:
- Check the exit code or return value explicitly
- Read back the result if it matters
- If the expected output is missing, investigate — don't assume it worked

## Verify Before Claiming Done
After every edit:
- Read the changed section back from the file
- Quote the actual content — not "I changed X to Y" but the literal lines
- Only write ✓ after quoting

A summary is not verification. The file content is verification.

## One Change at a Time
Do not stack multiple unverified changes. Apply one change, verify it, then proceed.
If a second change depends on the first being correct, verify the first before starting the second.

## Tool-Result Hygiene — Prefer Targeted Reads
Every token loaded into context lives there until compaction. Keep it lean:
- **File reads:** always use `Read offset=LINE limit=N` on files over a few hundred lines. Never read large files in full.
- **Greps:** use `head_limit` to cap matches. A 500-match grep dump is usually useless; top 20 is usually enough.
- **User pastes:** if the user pastes a stack trace / log / file >50 lines, ask them to crop to the relevant lines instead of analyzing the whole dump.
- **Prefer indexes over scans:** function indexes and code maps let you jump; use them before reading source files.

Costs compound over long sessions. One lazy full-file read early = thousands of tokens carried forward.

## Don't Build Orchestration Without Evidence
Multi-role agents, gated workflows, 5-step ceremonies sound powerful on paper. They usually die in practice because the ceremony exceeds the value.

Before building any new orchestration (agent with 3+ steps, workflow with human-in-loop gates, meta-skill that invokes other skills):
- **Require ≥3 real feature uses** where the existing simpler tools (plan-before-edit, a single skill, a targeted subagent) demonstrably fell short
- **Default to extending existing skills first** — add a phase to an existing skill before creating a new one
- **If you build it anyway, try it once, then honestly assess** — kill it same-session if it feels heavy; do NOT "tune it later"

Trust the feeling. If a workflow feels heavy, you won't use it — which is worse than not having it.

---

*These rules exist because skipping them is where sessions go wrong.*
*None of them feel necessary until the moment they are.*
