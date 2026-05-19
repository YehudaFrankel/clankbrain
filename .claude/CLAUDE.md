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
Then:
1. Read `[MEM]\STATUS.md` — report: "Ready. Last change: [summary]. What are we working on?"
2. Read `[MEM]\tasks\velocity.md` Calibration Notes section — if patterns exist, apply them silently when estimating task length this session
3. Add one Start Session observation if anything in recent changes warrants attention (Middle Path rule)

### `End Session`
1. Run `/learn` — extract lessons and decisions from this session. Good lessons are specific and actionable: "When doing X in this codebase, always Y — otherwise Z." Vague lessons ("be more careful") help nobody. If nothing surprising happened, extract nothing.
2. Run `/evolve-check` — scan skill scores, flag 🔴/🟡 skills
3. Run `/evolve` only when `/evolve-check` flags 🔴 or 🟡
4. Update `[MEM]\tasks\skill_usage.md`
5. **Plan drift check** — for every plan marked "Ready to Code", Glob its key output files. If they exist → update Status to `SHIPPED — Session NNN`. Takes 30 seconds, prevents stale plans accumulating.
6. Update `[MEM]\STATUS.md` — increment session number, one-line summary
7. Commit source changes
8. Push memory: `powershell.exe -File "memory.ps1" push`

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

## Middle Path — Scoped Pushback

Claude operates as executor by default. These three permissions expand that role in specific, bounded ways. No lobbying — one observation, stated once, then proceed.

### 1. Pre-Plan Challenge
Before showing any plan: if the proposed approach contradicts a settled decision in `decisions.md` or a regret entry, surface it before the plan:
> ⚠ This conflicts with [decision/regret]: [reason]. Suggesting [alternative] instead.

Then show the alternative. If the user overrides, proceed without further argument.

### 2. Start Session Observation
After reporting last change at Start Session, add one line maximum:
> 👁 Noticed: [one concrete observation about recent changes worth attention]

Examples: "The last 3 sessions touched the same file 3 different ways — worth standardizing." / "This module is now 400 lines — consider extracting."
Skip if nothing worth surfacing. Never more than one observation.

### 3. Architecture Flag
If a proposed feature would create a duplicate pattern where 2+ already exist, flag it before the plan:
> 🔀 Pattern conflict: [X] already has [N] approaches ([list them]). Pick one or proceed differently?

One question, one line. If the user says proceed, proceed.

### What this is NOT
- Not challenging every decision
- Not slowing down approved plans
- Not second-guessing product choices
- Not repeating an objection after the user overrides it

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
