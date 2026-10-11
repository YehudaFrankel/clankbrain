# Rules: Standing Instructions for Claude

**Rules** are short text files in `.claude/rules/` that Claude reads as standing instructions, so you do not have to repeat them. Examples are "make a plan before editing code" or "never use string joins to build SQL."

Use this page when you want Claude to always follow a habit, or when your `CLAUDE.md` file (the main instruction file Claude reads every session) is getting too long.

There are two ways a rule can load: always, or only when it is relevant.

---

## Always-loaded rules

A rule loads on every session when `CLAUDE.md` imports it with a line starting with `@`:

```
@rules/plan-before-edit.md
@rules/work-rules.md
```

Each always-loaded rule uses space on every turn, so keep this list short. This repo's own `CLAUDE.md` imports these four:

| Rule | What it says |
|------|-------------|
| `build-mode` | Say whether the session is for learning (prototype) or shipping (production). |
| `plan-before-edit` | Show a plan and wait for approval before changing code. |
| `work-rules` | Search first, check your work, stop when something unexpected happens. |
| `token-rules` | Manage context: when to compact, run `/learn` first. |

---

## Rules that load only when relevant

A rule with a `paths:` list in its header loads only when you work on matching files. Editing CSS will not load your Java rules.

```markdown
---
description: SQL quoting rules for Java and SQL files
paths:
  - "**/*.java"
  - "**/*.sql"
---

Always escape user text before putting it in a SQL string.
```

Two things to know:

- Do not also import the rule with `@rules/` in `CLAUDE.md`. An imported rule always loads, whatever its header says.
- The kit's own `guard-patterns.md` and `update-code-map.md` use `paths:`. Some files use `alwaysApply: true` (for example `regret.md`) and some older examples use `globs:` with `alwaysApply: false`. Those two names are Cursor-style fields. Use `paths:` for new rules.

### Common patterns for `paths:`

A pattern like `**/*.java` means "any `.java` file in any folder."

| Files | Pattern |
|-------|---------|
| All Java | `**/*.java` |
| Java and SQL | `**/*.java`, `**/*.sql` |
| JavaScript and TypeScript | `**/*.js`, `**/*.ts`, `**/*.jsx`, `**/*.tsx` |
| HTML, CSS and JS | `**/*.html`, `**/*.css`, `**/*.js` |
| Python | `**/*.py` |
| Many code types | `**/*.{js,ts,java,py,go,rb,sql}` |

---

## Which rules should always load?

A good split for a new project:

| Rule | Mode | Why |
|------|------|-----|
| `plan-before-edit` | always | Applies to every file type. It must say to wait for approval. |
| `work-rules` | always | About behavior, not one kind of file. |
| `token-rules` | always | Context management applies everywhere. |
| `karpathy-principles` | always | Four general habits: think first, keep it simple, change only what you must, check your result. |
| `coding-conventions` | by path (code files) | Only needed while writing code. |
| `database` | by path (`*.java`, `*.sql`) | Only needed near database code. |
| `design-system` | by path (`*.html`, `*.css`, `*.js`) | Only needed in front-end files. |
| `error-lookup` | by path (code files) | Only needed when debugging. |

Keep `CLAUDE.md` short (the kit's own file says under 200 lines) and put the rest in rules.

---

## Write a new rule

1. Create a file in `.claude/rules/`, for example `typescript.md`.
2. Paste this and edit it:

```markdown
---
description: One-line summary. Be specific.
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

## Rule title

Your instructions here. Be direct. Claude reads this text as written.
```

3. If it should load every session, delete the `paths:` lines and add `@rules/typescript.md` to `CLAUDE.md`.

Check that it worked: start a session, then ask Claude "what rules do you have loaded for this project?"

---

## What setup creates

A full install writes these starter rule files. Some are placeholders that `/scan-codebase` fills in on the first Start Session:

- `coding-conventions.md`, `file-paths.md`, `protected-files.md`
- `plan-before-edit.md`
- `common-traps.md`, `post-edit-checks.md`
- `stack.md`, `conventions.md`, `decisions.md` (written in the Lite install)

Next: [extending.md](extending.md) shows how to add skills, agents and rules.
