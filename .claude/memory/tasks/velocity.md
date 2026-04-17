# Velocity Tracker — Estimated vs Actual Sessions

_Self-calibrating estimates. Claude reads this before estimating task complexity._
_After 20+ entries, Claude uses real track record instead of guessing._

## Two units of velocity

**Discovery sessions** (build to learn) — measure hypotheses tested per session, not features shipped.
A discovery session that tests 5 hypotheses and rejects 4 is HIGH velocity, not low.

**Delivery sessions** (build to earn) — measure features shipped per session, with conventions intact.
A delivery session that ships 1 feature with smoke test passing is the unit.

Discovery sessions look like "no progress" by feature-shipped metrics but produce the locked decisions that make delivery 2-3x faster. Don't conflate the two. Track separately.

---

## Delivery Sessions (build to earn)

| Date | Task | Estimated Sessions | Actual Sessions | Complexity (1-5) | Notes |
|------|------|--------------------|-----------------|-------------------|-------|
<!-- Add entries each session — estimated at start, actual at end -->
<!-- Example: | 2026-01-15 | Add user auth flow | 1 | 2 | 4 | More edge cases than expected | -->

---

## Discovery Sessions (build to learn)

| Date | Project | Hypotheses Tested | Hypotheses Confirmed | Hypotheses Rejected | Notes |
|------|---------|-------------------|----------------------|---------------------|-------|
<!-- Add entries each discovery session -->
<!-- Example: | 2026-01-15 | Onboarding redesign | 3 | Single-step signup works | Multi-step lost users | -->

---

## Calibration Notes
<!-- /learn updates this section with patterns it notices over time -->
<!-- Example: "Bug fixes: almost always 1 session" -->
<!-- Example: "Pre-planned builds take half the estimated time. Halve the estimate for phases with locked build plans." -->
