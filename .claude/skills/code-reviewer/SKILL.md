---
name: code-reviewer
description: Language-agnostic code review. Checks correctness, security, and consistency with project conventions. Triggers on "review this", "review [file]", "check this code", "code review".
allowed-tools: Read, Glob, Grep, Bash
---

# Skill: code-reviewer

**Trigger:** `"review this"` · `"review [file]"` · `"check this code"` · `"code review"`

---

## Steps

### Step 0 — Load project context (before looking at any code)

Check for each of these files and read them if they exist:

**`memory/lessons.md`**
- Extract any lines flagged as mistakes, anti-patterns, or corrections
- Add each one as a custom checklist item under a `### Project Lessons` section
- Example: "never use addRow on IDENTITY tables" → becomes a checklist item

**`memory/decisions.md`**
- Extract locked architectural decisions the code must follow
- Add violations of these as automatic failures regardless of the standard checklist

**`memory/complexity_profile.md`** (written by `map-codebase`)
- Read the detected stack — use it to enable the right checklist sections:
  - SQL / ORM detected → enable **Data Layer** section
  - Auth middleware detected → enable **API / Endpoints** section
  - Frontend JS detected → enable **JS Patterns** section
  - Python detected → enable **Python Patterns** section
  - Java detected → enable **Java Patterns** section

If none of these files exist yet: skip Step 0, run the standard checklist only, and note at the top: `No project context loaded — running generic checklist. Run map-codebase and a session to sharpen this.`

---

### Step 1 — Read the file(s)

Read the file(s) being reviewed in full. If a file is too large, grep for the patterns most likely to fail first.

---

### Step 2 — Run checklist

Run every applicable section. Report every issue with file + line number. Report clean sections explicitly — never skip them silently.

---

## Standard Checklist

### Security
- [ ] No SQL / command injection — user input is quoted or parameterized before DB/shell use
- [ ] No secrets or API keys hardcoded
- [ ] Auth checks present on protected routes/endpoints
- [ ] User input validated at system boundaries (not trusted internally)

### Correctness
- [ ] Null / undefined / empty checks before dereferencing
- [ ] Array bounds safe — no off-by-one
- [ ] Error paths return or throw — never fall through silently
- [ ] Async operations awaited or `.then()`-chained correctly (JS) / try-catch present (Java/Python)

### Data Layer *(enabled if SQL/ORM detected)*
- [ ] No `SELECT *` — explicit column list
- [ ] Single-row queries check for results before accessing
- [ ] Loop queries don't issue N+1 DB calls — pre-load with a map if needed
- [ ] INSERT/UPDATE includes required audit fields (created_at, created_by, org/tenant id)

### API / Endpoints *(enabled if auth/routing detected)*
- [ ] Public endpoints registered correctly (auth-bypass list if applicable)
- [ ] Both success and error paths return a valid response
- [ ] Error messages don't expose stack traces or internal details
- [ ] Response shape matches what the frontend expects

### JS Patterns *(enabled if frontend JS detected)*
- [ ] No `var` in module scope leaking globals unintentionally
- [ ] DOM access uses `getElementById` / `querySelector` — not jQuery unless project uses it
- [ ] No inline event handlers in dynamically generated HTML
- [ ] User data escaped before `innerHTML` — never raw interpolation

### Java Patterns *(enabled if Java detected)*
- [ ] No raw types — generics used properly
- [ ] Resources closed in finally or try-with-resources
- [ ] No swallowed exceptions (`catch (Exception e) {}`)
- [ ] Null checks before dereferencing

### Python Patterns *(enabled if Python detected)*
- [ ] No mutable default arguments (`def f(x=[])`)
- [ ] `with` used for file/connection handling
- [ ] No bare `except:` — always catch specific exceptions

### Code Quality
- [ ] No duplicate logic that already exists elsewhere — reuse helpers
- [ ] No hardcoded values that should be constants or config
- [ ] Exceptions caught and handled — no swallowed errors
- [ ] Resources closed after use

### Project Lessons *(populated from lessons.md at runtime)*
*This section is built dynamically from your project's memory. Empty on first session.*

---

## Report Format

```
Context loaded: lessons.md (N patterns), decisions.md (N decisions), stack: [detected]

❌ [file]:[line] — [issue]
   Fix: [specific fix]

✅ [section] — clean
```

End with: `N issues found` or `Clean — no issues.`

---

## Notes

- Security and correctness first — style is secondary
- If no project context exists yet, say so at the top — don't silently skip it
- After finding a new pattern, suggest adding it to lessons.md via `/learn`
