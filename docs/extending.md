# Extending Clankbrain

Everything in `.claude/` is yours to change. This page shows how to add your own skills, agents and rules. You do not need to write code. Each one is a text file.

| You want to... | Add a... | Where it goes |
|----------------|----------|---------------|
| Teach Claude a task it can repeat | Skill | `.claude/skills/<name>/SKILL.md` |
| Run a multi-step workflow with stops for your OK | Agent | `.claude/agents/<name>.md` |
| Give Claude a standing instruction | Rule | `.claude/rules/<name>.md` |

---

## Add a skill

A **skill** is a saved set of instructions Claude follows when you ask for a task.

The easy way: tell Claude `Create a skill called [name] that [does what]`. It writes the file.

By hand:

1. Make a folder `.claude/skills/my-skill/`.
2. Inside it, create `SKILL.md`:

```markdown
---
name: my-skill
description: What triggers this skill (the phrases Claude should watch for)
allowed-tools: Read, Grep, Edit
---

## Steps

1. First step: what Claude does
2. Second step
3. ...
```

Claude matches your message against the `description`, so write it the way you would say it: "review this PR", "add a new endpoint", "before I ship". `allowed-tools` lists the tools the skill may use.

Optional: add `effort: low` (or `medium`, `high`, `xhigh`, `max`, or a whole number) to set how much thinking effort the skill uses.

To check it worked, type one of the trigger phrases in a session. See [skills.md](skills.md) for the full list and the learning loop.

---

## Add an agent

An **agent** is a multi-step workflow with checkpoints (called breakpoints).

1. Create `.claude/agents/my-workflow.md`:

```markdown
---
name: my-workflow
description: When to use this workflow
---

## Step 1 — First thing

Describe what Claude does. Call skills with `Run /skill-name`.

**BREAKPOINT — Show [what]. Wait for "continue" before Step 2.**

## Step 2 — Second thing

Next step.
```

See [agents.md](agents.md) for the four built-in agents and breakpoint tips.

---

## Add a rule

A **rule** is an instruction file Claude reads every session, or only when you work on matching files.

1. Create `.claude/rules/my-rule.md`:

```markdown
---
description: One-line summary
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

## Your rule

Write the instruction in plain words.
```

2. Do not import it with `@rules/` in `CLAUDE.md`. That would make it load every time.

To load a rule on every session instead, remove the `paths:` lines and add `@rules/my-rule.md` to `CLAUDE.md`. See [rules.md](rules.md) for the full explanation.

---

## Add a hook

A **hook** is a small script Claude Code runs automatically at certain moments. Clankbrain's hooks are listed in `.claude/settings.json`. To run one of the extra `memory.py` commands that no installer wires, such as `--file-changed`, add an entry yourself. Example, to check on file changes:

```json
"FileChanged": [
  { "hooks": [ { "type": "command", "command": "python tools/memory.py --file-changed", "timeout": 5 } ] }
]
```

Hook names must be ones your Claude Code version knows. A very old version ignores all hooks if it sees an unknown name. See [hooks.md](hooks.md).

---

## Keep CLAUDE.md short

`CLAUDE.md` is the main file Claude reads every session. A long file costs space on every message. The kit's own file asks you to keep it under 200 lines. Signs it is too long:

- Detailed coding conventions: move them to a rule.
- Long command descriptions: shrink them to a table.
- Architecture notes: move them to a memory file or `docs/`.

A "Skill Map" table replaces pages of "when to use what" text:

```markdown
## Skill Map

| Workflow | Skills in Order |
|----------|----------------|
| New Feature | `/search-first` → `/plan` → *(code)* → `/code-reviewer` → `/learn` |
| Bug Fix | `/debug-session` → *(fix)* → `/verification-loop` → `/learn` |
| End of Session | `/learn` → `/evolve` *(every 3 to 5 sessions)* |
```
