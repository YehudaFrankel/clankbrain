# Plan Before Edit — Required for All Code Changes

Before making ANY edit to code files (JS, HTML, CSS, SQL, any backend language), you MUST stop and present a plan. Do NOT apply edits until the user explicitly says to proceed.

**Does NOT apply to:** memory files, `.claude/` rules/skills/settings files.

---

## Required Plan Format

For each change, show:

### Problem / Feature
One clear sentence: what is broken or what needs to be added.

### All Related Functions / Files
List every function and file touched by this change — including callers, callees, and any frontend/backend pair.
Format: `functionName` — `path/to/file.ext:LINE`

Example:
- `saveUser` — `src/api/users.js:142`
- `retSaveUser` — `src/frontend/userFunctions.js:88`

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
- **Files touched:** list every file that will change
- **Lines changed:** approximate count
- **Type:** Logic change | Refactor (no behavior change) | Config/data only
- **Affected at runtime:** what breaks if this goes wrong (e.g., "all API endpoints fail", "login flow breaks", "CSS only — no runtime impact")

### Rollback
How to undo this change if something goes wrong:
- Git: `git restore path/to/file.ext` (if not yet committed)
- Or: what to manually revert

---

## Example

**Problem:** `saveUser` inserts without checking for duplicates — duplicate emails cause a DB constraint error.

**All Related Functions:**
- `saveUser` — `src/api/users.js:142`
- `retSaveUser` — `src/frontend/userFunctions.js:88`

**Before:**
```javascript
db.query('INSERT INTO users (email, name) VALUES (?, ?)', [email, name]);
```

**After:**
```javascript
const existing = await db.query('SELECT id FROM users WHERE email = ?', [email]);
if (existing.length) return { error: 'Email already registered' };
db.query('INSERT INTO users (email, name) VALUES (?, ?)', [email, name]);
```

**Why:** The INSERT has no guard — adding a SELECT first catches duplicates before hitting the DB constraint, returning a clean error instead of a 500.

**Scope / Blast Radius:**
- Files touched: `src/api/users.js`
- Lines changed: ~4
- Type: Logic change
- Affected at runtime: signup flow — if the SELECT fails, users get a 500 instead of a duplicate error

**Rollback:** `git restore src/api/users.js`

---

## Rule

Show the plan. Wait for "yes", "go ahead", "do it", or equivalent. Only then edit.
