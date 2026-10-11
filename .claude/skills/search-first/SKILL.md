---
name: search-first
description: "Enforces research-before-coding. Before writing any new code, search the existing codebase for reusable patterns, existing implementations, and prior art. Prevents duplicated logic. Triggers on Automatically before any new feature implementation, or \"search first\" or \"check if this exists\"."
allowed-tools: Read, Glob, Grep, Bash
---
# Skill: search-first

**Trigger:** Automatically before any new feature implementation, or "search first" or "check if this exists"

**Description:** Enforces research-before-coding. Before writing any new code, search the existing codebase for reusable patterns, existing implementations, and prior art. Prevents duplicated logic.

**Allowed Tools:** Read, Glob, Grep, Bash

---

## Steps

1. **Search existing code for similar functionality:**
   - Grep for method names, endpoint names, or key terms
   - Does something already do what's being requested?

2. **Search memory indexes:**
   - Check function indexes / API reference in `.claude/memory/`
   - Check architecture docs for existing patterns

3. **Search for existing patterns:**
   - Is there a helper or utility that already handles this?
   - Can an existing function be extended rather than duplicating?

4. **Check for existing data fetching:**
   - Is there already an API endpoint that returns this data?
   - Can the frontend reuse an existing call?

5. **Report findings:**
   - ✅ "Found existing: `[method/function]` in `[file]` — reuse this, no new code needed"
   - ⚠️ "Partial match: `[method]` — extend this instead of creating new"
   - 🆕 "No existing pattern found — safe to create new"

6. **Only proceed to plan/code after search is complete**

---

## Why This Matters

- Duplicate logic = two places to fix when bugs appear
- Searching takes 2 minutes and can save hours of debugging
- The best code is code you don't write

---

## Notes

- Search memory indexes first (faster) before reading source files
- If a pattern appears in 3+ places, it should be extracted into a shared utility
- After finding existing code: check if it needs to be updated vs reused as-is
- This skill pairs with plan-before-coding — search → plan → confirm → code
