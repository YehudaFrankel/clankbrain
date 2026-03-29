---
name: code-reviewer
description: Language-agnostic code review. Checks correctness, security, and consistency with project conventions. Triggers on "review this", "review [file]", "check this code", "code review".
allowed-tools: Read, Glob, Grep, Bash
---

# Skill: code-reviewer

**Trigger:** `"review this"` · `"review [file]"` · `"check this code"` · `"code review"`

---

## Steps

1. **Read the file(s)** being reviewed
2. **Run each checklist section** — report every issue with file + line number
3. **Report clean sections** explicitly — don't skip them silently

---

## Checklist

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

### Data Layer
- [ ] No `SELECT *` — explicit column list
- [ ] Single-row queries check for results before accessing
- [ ] Loop queries don't issue N+1 DB calls — pre-load with a map if needed
- [ ] INSERT/UPDATE includes required audit fields (created_at, created_by, org/tenant id)

### API / Endpoints
- [ ] Public endpoints registered correctly (auth-bypass list if applicable)
- [ ] Both success and error paths return a valid response
- [ ] Error messages don't expose stack traces or internal details
- [ ] Response shape matches what the frontend expects

### Code Quality
- [ ] No duplicate logic that already exists elsewhere — reuse helpers
- [ ] No hardcoded values that should be constants or config
- [ ] Exceptions caught and handled — no swallowed `catch (e) {}`
- [ ] Resources closed after use (files, DB connections, streams)

---

## Report Format

```
❌ [file]:[line] — [issue]
   Fix: [specific fix]

✅ [section] — clean
```

End with a one-line summary: `N issues found` or `Clean — no issues.`

---

## Notes

- Add project-specific patterns to this checklist via `/learn` as you discover them
- Security and correctness first — style is secondary
- If a file is too large to read fully, grep for the patterns most likely to fail first
