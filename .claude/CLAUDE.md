# [Your Project Name] — Claude Code Project Context

## Memory & GitHub

Memory repo: **https://github.com/[YOUR_GITHUB]/Claude-memory** (private)

**`[MEM]`** = `[YOUR_MEMORY_PATH]`
All memory files, tasks/, and STATUS.md live here.

**What gets pushed:** `memory.ps1 push` copies the ENTIRE `.claude/` folder into the memory repo before committing. Everything in `.claude/` must be in GitHub — no exceptions.

**Pull on every Start Session — no exceptions.**

---

## Commands

### `Start Session`
Run manually if hook fails:
```
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "[YOUR_PROJECT_PATH]/memory.ps1" pull
```
Then read `[MEM]\STATUS.md` and report: "Ready. Last change: [summary]. What are we working on?"

### `End Session`
1. Run `/learn` — extract lessons and decisions from this session
2. Run `/evolve-check` — scan skill scores, flag 🔴/🟡 skills
3. Run `/evolve` only when `/evolve-check` flags 🔴 or 🟡
4. Update `[MEM]\tasks\skill_usage.md`
5. Update `[MEM]\STATUS.md` — increment session number, one-line summary
6. Commit source changes
7. Push memory: `powershell.exe -File "memory.ps1" push`

### `Push Memory`
Run: `powershell -File "memory.ps1" push`

### `Pull Memory`
Run: `powershell -File "memory.ps1" pull`

---

## What This Project Is
[Describe your project here — stack, purpose, key files]

---

## Tech Stack
- **Backend:** [e.g. Java, Node, Python]
- **Frontend:** [e.g. React, Vanilla JS]
- **Database:** [e.g. PostgreSQL, SQL Server]

---

## Skill Map

| Workflow | Skills in Order |
|----------|----------------|
| **New Feature** | `/search-first` → `/plan` → *(code)* → `/simplify` → `/smoke-test` → `/learn` |
| **Bug Fix** | `/debug-session` → `/fix-bug` → `/simplify` → `/smoke-test` → `/learn` |
| **End of Session** | `/learn` → `/evolve-check` → update STATUS.md → `/guard` → `memory.ps1 push` |

---

@rules/plan-before-edit.md
@rules/regret.md
@rules/regret-top.md
