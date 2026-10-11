---
name: strategic-compact
description: "Evaluates whether context should be compacted and guides through safe compaction that preserves all memory. Prevents the context-limit mid-task problem. Triggers on \"should I compact?\" or \"compact now?\" or \"context getting long\" or when session is large."
allowed-tools: Read, Bash
---
# Skill: strategic-compact

**Trigger:** "should I compact?" or "compact now?" or "context getting long" or when session is large

**Description:** Evaluates whether context should be compacted and guides through safe compaction that preserves all memory. Prevents the context-limit mid-task problem.

**Allowed Tools:** Read, Bash

---

## When to Suggest Compaction

Suggest compacting when ANY of these are true:
- **Context usage reaches 40%** — hard trigger, don't wait for slowdown
- Session has 60+ back-and-forth messages
- User asks about something already resolved earlier in session
- Responses feel slow or repetitive
- A major task just completed naturally (good break point)
- Context limit warning appears

**Never compact:**
- Mid-task — always finish current task first
- Before saving memory to your storage system
- Before running `/learn` to capture session patterns

---

## Steps

### Before Compacting:
1. **Capture session patterns:**
   - Run `/learn` to extract lessons to `.claude/memory/lessons.md`
   - Confirm entries were written

2. **Save/push memory** to your storage system (GitHub, local, etc.)

3. **Update STATUS.md** or equivalent with current progress so it loads on resume

4. **Confirm with user:** "Memory saved. Safe to compact — session will resume with full context."

### After Compacting:
- SessionStart hook should auto-load memory (if configured)
- Verify memory loaded by checking that project status was mentioned in first response
- If memory didn't auto-load: run your session start command manually

---

## Notes

- Compaction is safe when memory system is properly set up — that's what it's for
- The PreCompact hook handles state preservation automatically if configured
- After compact, full project context available within 1-2 messages
- Better to compact proactively than to hit context limit mid-task
