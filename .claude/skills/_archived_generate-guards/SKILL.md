---
name: generate-guards
description: Scan this project's error history and codebase to propose project-specific guards for guard-patterns.md. Generic guards ship with the kit — this skill creates the ones that prevent YOUR recurring mistakes. Trigger phrases: "generate guards", "add guards", "create project guards", "what guards should I add", "guards from my errors".
model: claude-sonnet-4-5
effort: medium
allowed-tools: Read, Grep, Glob, Edit
---

# Skill: generate-guards

**Trigger:** `"generate guards"` · `"add guards"` · `"create project guards"` · `"what guards should I add"` · `"guards from my errors"`

---

## Why this matters

The 4 generic guards that ship with Clankbrain (`NULL_BEFORE_ACCESS`, `HARDCODED_URL`, `RAW_ERROR_EXPOSURE`, `CONSOLE_LOG_LEFT_IN`) are starting points. The ones that actually prevent *your* mistakes are derived from your own error history. Every entry in `error-lookup.md` and `regret.md` is a candidate guard — a mistake the codebase could have caught automatically.

This skill converts your error history into automated prevention.

---

## Steps

### Step 1 — Read existing guards
- Read `.claude/rules/guard-patterns.md`
- List guard IDs already present — don't propose duplicates
- Note which file types and patterns are already covered

### Step 2 — Mine error history for guard candidates

**From error-lookup.md** (highest priority — already proved costly):
- Read `.claude/memory/error-lookup.md`
- For each known error: *could a grep pattern have caught this before it ran?*
- If yes → strong candidate; mark it as `[from error history]`

**From regret.md** (rejected approaches that might slip back in):
- Read `.claude/memory/tasks/regret.md`
- For each rejected approach: is there a code pattern that signals this approach being used?
- If greppable → candidate; mark it as `[from regret log]`

**From lessons.md** (recurring patterns):
- Read `tasks/lessons.md`
- Look for lessons mentioning a specific code pattern to avoid
- If a pattern appears in 2+ lessons → strong candidate

**From the stack** (general best practices for detected tech):
- Check what languages are in the project (Glob for `.java`, `.js`, `.py`, etc.)
- Apply stack-specific candidates: SQL concatenation (Java/Python), async without await (JS), missing null checks (Java), etc.
- Use Grep to confirm the pattern actually exists in this codebase before proposing it

### Step 3 — Propose guards

For each candidate, format it as:
```markdown
## GUARD_ID
- **Check**: [one sentence: what this guards against]
- **How to scan**: Grep for `[exact regex pattern]` in [file scope, e.g. "*.java", "*.js"]
- **Files**: [specific files or file types]
- **Why**: [what breaks if this pattern appears — reference the error or lesson that caused it]
```

Show all candidates. For each one:
- Mark source: `[from error history]`, `[from regret log]`, `[from lessons]`, or `[best practice]`
- State what specific past mistake it would have caught, if known

Prioritize error-history and regret-log guards first — they have proven cost.

### Step 4 — Confirm before writing

Do NOT write to `guard-patterns.md` without confirmation.

Ask: "Add these [N] guards to guard-patterns.md? Say yes to add all, or list which ones to keep."

### Step 5 — Write confirmed guards

Append each confirmed guard to `.claude/rules/guard-patterns.md` with a blank line between guards.

Then report: "[N] guards added. Run `Guard Check` to scan the codebase for existing violations now."

---

## Closing message

"Guards added to guard-patterns.md. These run automatically on `Guard Check` and `Pre-Ship Check`. Re-run this skill after every 5 sessions — your error history grows, and so should your guards."
