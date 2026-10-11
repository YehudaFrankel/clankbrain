# Agents: Multi-Step Workflows

A skill does one job. An **agent**, in Clankbrain, is a longer workflow made of several steps. It runs those steps in order and stops at checkpoints so you can review before it continues. Each agent is a markdown file in `.claude/agents/`.

Use an agent when a job has several stages, such as building a feature or fixing a hard bug. For a single small task, a skill is enough.

Note: the installer does not copy agents into your project. They live in this repo's `.claude/agents/` folder. To use one, copy the file into your own project's `.claude/agents/` folder.

---

## The four agents

| Agent file | Use it when | Steps |
|------------|------------|-------|
| `feature-build.md` | You are building a new feature | search first, plan, implement, review, verify, learn |
| `bug-fix.md` | You are chasing a bug | reproduce, isolate, fix, verify, log and learn |
| `end-session.md` | You are finishing for the day | extract lessons, update memory, guard scan, drift check, update STATUS.md, evolve check, sync (if set up), final report |
| `plan.md` | You are designing something | understand the goal, research, draft options, write the plan, execute, close |

---

## How they work: breakpoints

A **breakpoint** is a stop sign inside the agent file. At a breakpoint Claude shows what it found or made, then waits for you to say "continue." You can also stop, change direction, or ask for something different.

```markdown
## Step 1 — Search

Run `/search-first` with the feature description.
Find every related function. Note call chains and DB tables involved.

**BREAKPOINT — Show findings. Wait for "continue" before Step 2.**
```

Example of what you see:

```
Claude: Step 1 done. Found 3 related functions and 2 tables (details above).
        Reply "continue" to start the plan.
You:    continue
```

Most steps end with a breakpoint. The `end-session` agent has fewer, because its steps are routine.

---

## Agents compared with skills

| | Skills | Agents |
|-|--------|--------|
| Size | One task | A whole workflow |
| How to start | A matching phrase or `/name` | Ask for it by name |
| Stops to check with you | No, it runs to the end | Yes, at each breakpoint |
| Linking to the next step | An `## Auto-Chain` section | Steps written in order |
| Best for | One clear task | A feature or a bug fix |

---

## Write your own agent

1. Create a file in `.claude/agents/`, for example `my-workflow.md`.
2. Paste this and edit it:

```markdown
---
name: my-workflow
description: When to use this agent
---

## Step 1 — First thing

Do this. Check that. Report findings.

**BREAKPOINT — Show [what]. Wait for "continue" before Step 2.**

## Step 2 — Second thing

Do this next.
```

Tips:

- End each step with one breakpoint.
- Say exactly what Claude should show at the breakpoint (findings, a plan, review results).
- Say which word to wait for, such as "continue."
- Where you can, write `Run /skill-name` instead of repeating instructions. That keeps agents short and skills reusable.

See [skills.md](skills.md) for the skills these agents call, and [extending.md](extending.md) for other ways to customize Clankbrain.
