# Top Regrets — Auto-loaded, Always in Context

The most frequently re-proposed mistakes. Check before every plan.

**Maintenance rule:** Any entry that recurs 2+ times gets promoted here immediately.
When `regret.md` gets a new entry that has occurred 2+ times → add it here. Keep in sync.

---

## 1. Writing a full file replacement (>1500 lines) in a single Write call
Exceeds single-response output limit — agent stalls before finishing.
**Always:** use targeted `Edit` calls instead of full file rewrites.

## 2. Em-dashes or special Unicode in strings that pass through encoding layers
`—` renders as `â€"` after byte re-encoding. Smart quotes similarly corrupted.
**Always:** use plain ASCII hyphens ` - ` and straight quotes in any string that passes through encoding/transport layers.

## 3. `<button>` without `type="button"` inside or near a `<form>`
Default button type is `submit` — clicks the form, not your handler.
**Always:** every dynamically injected `<button>` must have `type="button"`.

## 4. `opacity: 0` hides content but preserves layout space
Invisible element still occupies height/width — user sees blank rectangle.
**Always:** use `display: none` to remove space, `opacity: 0` only when layout must be preserved.

## 5. Raw base64 sent via URL/API without URL-safe encoding
`+` in standard base64 → decoded as space → corrupted binary.
**Always:** `base64.replace(/\+/g, '-').replace(/\//g, '_')` before sending; reverse on server.

## 6. Aggressive CSS override strips ALL descendant element styles
`#parent div { border: none !important }` nukes custom component borders too.
**Pattern:** One override block to strip framework chrome, one restore block per custom component with equal/higher specificity.

## 7. Nested async callbacks carrying state invisibly
State mutations inside callbacks are invisible to the outer scope — silent bugs.
**Always:** use module-level globals to carry state across async boundaries; each step gets its own named callback.

## 8. Skipping the full plan — ZERO EXCEPTIONS
**Never apply any edit to any code file without first presenting the complete plan and waiting for explicit approval.**
This applies to every file, every change, no matter how small, obvious, or fast.
**The trap:** "It's just a text change" / "It's obviously correct" / "We're moving fast" — these are the exact conditions where the rule matters most.
**"Yes" to a concept ≠ plan approved.** A description or mockup is concept alignment only. The Before/After, Scope, Evaluation, Challenge, and Rollback must still be shown before any edit runs.

## 9. Writing INSERT or SELECT without first verifying the actual table schema
**Always:** check the real schema (grep schema files or read the table definition) before writing any INSERT or SELECT column list. Verify every column name exists.
**Why:** Assumed columns (EntityID, CreatedBy, etc.) may not exist on every table. One wrong column = runtime error that brings down the endpoint.

## 10. Treating "not in the plan" as "doesn't need a plan"
Any edit to a code file — even a one-line compile fix, a typo correction, a constant rename — requires a plan with Before/After shown.
**Why:** "Obvious" fixes are where violations accumulate. Each one feels safe. Together they compound into broken states with no audit trail.
