# Build Mode — Declare Discovery or Delivery

Every work session has a mode. Declare it before writing any code. The mode determines which conventions apply.

---

## The Two Modes

### Build to Learn (Discovery)
Goal: reduce risk. Test a hypothesis. Find out if something works before committing to building it for real.

**Examples:**
- HTML prototypes (KeepAliveNow*.html in mobile/)
- Throwaway scripts to validate an approach
- A/B variants of a UI to see which works
- Mock data to test a flow before wiring real backend

**Conventions that apply:**
- Speed beats quality
- Hardcode data — no DB writes
- Skip error handling (inline `try/catch` is fine, no need for proper recovery)
- Skip tests
- Skip plan-before-edit for prototype iteration *if* a hypothesis is logged
- Comments okay if they explain what you're testing
- Allowed to break conventions for speed

**Conventions that DO NOT apply:**
- Coding conventions (HFW pattern, executeSql rules, etc.)
- Smoke test requirement
- Guard scan
- Code-map updates
- Plan-before-edit for individual edits (use prototype-hypothesis skill instead)

### Build to Earn (Delivery)
Goal: ship something users will actually run. Production quality.

**Examples:**
- Phase 1+ of KeepAliveNow build plan
- Adding a real endpoint to TicTacWisdom
- Any code that touches `apps/`, real DB tables, or production HTML pages
- Anything that survives the session

**Conventions that apply:**
- All of `coding-conventions.md`
- All of `regret.md`
- Plan-before-edit for every edit
- Smoke test after Java changes
- Guard scan after JS/Java changes
- Code-map updates after structural changes
- Memory updates at end-session

---

## How to Declare

At the start of any work session, state the mode in one sentence:

> "Building to learn — testing whether [hypothesis]."
> "Building to earn — implementing [feature] from [build plan]."

If you cannot answer the build-to-learn question, you are NOT in discovery mode. You are guessing. Stop and either:
1. Write a hypothesis using the `prototype-hypothesis` skill
2. Switch to build-to-earn mode and follow conventions

---

## Mode Transitions

The transition from learn → earn is a one-way door for that feature:
- Locking the build plan = transition to earn
- Once in earn mode, no more "let me just try this" without a new discovery cycle
- If a delivery problem requires more discovery, explicitly switch back: "Pausing earn mode to learn whether X works."

The transition from earn → learn is rare and should be deliberate. It usually means a risk wasn't reduced enough during discovery.

---

## Why This Matters

Conflating modes causes both failure modes:
- **Delivery conventions in discovery** = slow prototyping, can't iterate fast enough to test ideas
- **Discovery conventions in delivery** = production code with no error handling, no tests, breaks under real load

The KeepAliveNow build is the canonical example: 10 sessions of pure discovery (no production code) followed by Phase 1 of pure delivery (full conventions). Both modes worked because they didn't mix.
