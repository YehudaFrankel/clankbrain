---
name: forget
description: Invalidate or remove a memory entry. Use when the user says "forget that", "that memory is wrong", "remove the X memory", "/forget X". Marks the file as invalidated rather than deleting — preserves history.
allowed-tools: Read, Edit, Grep, Bash
effort: fast
---

# Skill: forget

**Trigger phrases:**
- `/forget [topic or file name]`
- "forget that"
- "that memory is wrong / outdated"
- "remove the X memory"
- "delete the memory about X"
- "mark X as invalid"

---

## Steps

### Step 1 — Find the target memory

If the user named a file directly (e.g. `/forget feedback_plan_before_edit.md`), use that path.

Otherwise, run:
```
python tools/memory.py --search "[topic]" --top 5
```
Show the top result(s) and ask: "Is this the memory you want to remove? (yes / pick a number)"

### Step 2 — Read the file

Read the full file content so you can show the user what will be removed:
```
> **File:** [filename]
> [first 5 lines of content]
```

Confirm: "Mark this memory as invalidated? (yes/no)"

### Step 3 — Invalidate (do not delete)

Add `status: invalidated` to the frontmatter and a one-line note at the top of the body:

**Before:**
```markdown
---
name: some-feedback
type: feedback
---
Always do X when Y.
```

**After:**
```markdown
---
name: some-feedback
type: feedback
status: invalidated
invalidated: 2026-03-31
---
> **INVALIDATED** — removed by user. Kept for history only.

Always do X when Y.
```

Use Edit to apply the change — never delete the file.

### Step 4 — Remove from MEMORY.md index

Find the line in MEMORY.md that references this file and remove it:
```
- [Title](filename.md) — description
```

Delete that line using Edit.

### Step 5 — Confirm

Report:
```
Forgotten. [filename] is marked invalidated and removed from the index.
The file is kept in memory/ for history — it will no longer load at session start.
```

---

## Notes
- Never hard-delete memory files — always invalidate and keep
- The `status: invalidated` frontmatter prevents future confusion but preserves the audit trail
- If the user says "forget everything about X", run the search and offer a list to confirm each one individually
- After invalidating, check if any other memory files reference the invalidated one and note them
