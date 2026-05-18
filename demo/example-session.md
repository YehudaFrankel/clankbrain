# Example Session — Session 47

This is what a real session looks like after 6 months of use.
The lessons, decisions, and rejected approaches below were accumulated
across 46 prior sessions — Claude loads them automatically.

---

## Start Session

```
> Start Session

Session 47 ready. Last change: Dashboard pagination fix — page state
lost on filter change, debounce added.

20 lessons loaded. 8 decisions loaded. 5 rejected approaches on guard.

What are we working on?
```

---

## The regret guard fires (before any code)

```
> Add a feature flag to the user settings table — store as a boolean column

⚠ REGRET MATCH on your prompt — check regret.md before proceeding:
  "Adding boolean columns to user_settings — rejected Session 31 because
   schema migrations on this table require a deploy window; use the
   existing JSON settings column instead"

Still want to proceed, or use the JSON settings column?
```

*Without Clankbrain: Claude proposes the boolean column. You approve it.
You discover the migration problem in production 2 weeks later.*

---

## Plan before touching anything

```
> Use the JSON settings column

### Problem
Add feature flag `show_beta_dashboard` to user settings, stored in
the existing `settings` JSONB column.

### All Related Functions
- `get_user_settings` — src/db/users.ts:84
- `update_user_settings` — src/db/users.ts:112
- `UserSettings` type — src/types/user.ts:23

### Before
```ts
// src/types/user.ts:23
type UserSettings = {
  theme: string;
  notifications: boolean;
}
```

### After
```ts
type UserSettings = {
  theme: string;
  notifications: boolean;
  show_beta_dashboard?: boolean;
}
```

### Why this will work
JSONB column accepts new keys without migration. Existing rows return
`undefined` for the new key — treated as `false` by the feature check.

### Scope
- Files: src/types/user.ts, src/components/Dashboard.tsx
- Lines: 4
- Type: Additive — no breaking change

### Evaluation
Strong: zero migration, backward compatible.
Risk: if `show_beta_dashboard` is ever made required, a migration
will be needed then. Acceptable tradeoff.
Confidence: High

### Challenge
Should this be in a dedicated feature flags table instead of settings?
No — feature flags at this scale don't justify a new table. Settings
JSON is the right home until there are 10+ flags.

Proceed?
```

---

## After the edit

```
> yes

✓ Verified src/types/user.ts:23-27 — UserSettings now includes
  `show_beta_dashboard?: boolean`. Type is optional, existing
  code unaffected.

While verifying: Dashboard.tsx at line 156 reads `user.settings.theme`
directly without optional chaining. If settings is ever null, this
throws. Worth fixing before we continue?
```

*Clankbrain spotted something you didn't ask about.*

---

## End Session

```
> End Session

/learn

Extracted 2 lessons:

1. JSONB settings column accepts new keys without migration — use for
   feature flags until 10+ flags justify a dedicated table

2. Dashboard.tsx line 156 reads settings without null guard — pattern
   exists elsewhere in the codebase, check all direct settings reads

Memory saved:
  lessons.md    +2
  decisions.md  +1   ("feature flags in settings JSON, not new table")
  STATUS.md     +1   ("Session 47 — beta dashboard flag")

Session complete.
```

---

## What just happened

| Without Clankbrain | With Clankbrain |
|---|---|
| Boolean column proposed | Boolean column blocked by Session 31 memory |
| Migration discovered in prod | Never written |
| null guard missed | Caught during post-edit scan |
| Lesson forgotten | Saved automatically, loaded next session |

**Session 47 knew what Session 31 learned.
Session 48 will know what Session 47 learned.**

That's the compounding.
