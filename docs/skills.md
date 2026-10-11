# Skills and the Learning Loop

A **skill** is a saved set of instructions that Claude follows when you ask for a certain task. Each skill is one folder in `.claude/skills/` with a `SKILL.md` file inside. You do not run skills by hand. You describe what you want in plain English, or type a slash command like `/learn`, and Claude picks the matching skill.

Example:

```
You:    review this file before I ship
Claude: (uses the code-reviewer skill, then lists problems and waits for your OK)
```

This page lists every skill in the repo and explains the learning loop, which is how skills improve over time.

---

## Which skills get installed

Setup does not copy every skill. Names below are the real `name:` values in each `SKILL.md`.

| Install | Skills copied |
|---------|---------------|
| Full (default) | 19 skills, listed first below |
| Lite | 7 skills: `learn`, `smart-resume`, `recall`, `fix-bug`, `scan-codebase`, `start-session`, `end-session`. Lite also writes a basic `code-review` skill. |

A Full install also writes five short template skills for your project: `security-check`, `new-feature`, `environment-check`, `run-verification` and `refactor`.

The repo holds 36 skills. The 17 that Full does not copy are listed under "Only in the repo". You can use one by copying its folder from this repo's `.claude/skills/` into your project's `.claude/skills/`. Older skills are kept in folders starting with `_archived_`. They are not installed.

---

## Skills installed by default (Full)

| Skill | Say this to use it | What it does |
|-------|--------------------|-------------|
| `start-session` | "Start Session" | Loads memory and reports where you left off. |
| `end-session` | "End Session" | Saves lessons, updates memory and status, and pushes to GitHub if sync is set up. |
| `learn` | `/learn` | Saves patterns, lessons and decisions from the session. |
| `smart-resume` | "smart resume", "what were we working on" | Reads `STATUS.md`, `todo.md` and recent memory, then proposes the next step. |
| `recall` | `/recall [topic]`, "what did we decide about X" | Quick search of your memory for a topic. |
| `forget` | `/forget`, "that memory is wrong" | Marks a memory as invalid. |
| `plan` | "plan [feature]", "I want to build X" | Writes a plan file with options and logs your decision. |
| `search-first` | before adding new code | Looks for existing code to reuse before writing new code. |
| `debug-session` | "Debug Session" | Reproduce, isolate, guess, fix, verify, log. |
| `fix-bug` | "it's broken", "wrong result" | Fixes a logic bug, then verifies and runs `guard`. |
| `guard` | "guard check", "scan my changes" | Checks changed files against known error patterns. After a fix, saves the cause as a new pattern. |
| `verification-loop` | "verify this works", "before I ship" | Checks the build and key behavior after a change. |
| `skill-creator` | "create a skill called X" | Writes a new skill for you. |
| `mode` | "Mode review" | Limits which tools Claude may use for the session. |
| `tour` | "tour", "show me how this works" | A 5-minute walkthrough of Clankbrain. |
| `kit-health` | "kit health" | Confirms the install is complete and working. |
| `evolve-check` | "evolve check", "skill health" | Read-only report on which skills need fixing. |
| `evolve` | `/evolve` | Fixes failing skills and builds new ones from repeated lessons. |
| `scan-codebase` | "scan the codebase" | Reads your code and writes project-specific rules. Runs on the first Start Session if no code map exists. |

## Only in the repo (not installed by default)

| Skill | What it does |
|-------|-------------|
| `act` | Looks at recent work and proposes the next action. |
| `check-anthropic` | Reads Claude Code release notes and docs and reports features you could use. |
| `code-review` | Reviews a file for bugs and bad patterns. |
| `code-reviewer` | Language-neutral review that also checks your lessons and decisions. |
| `frontend-design` | Picks a design direction (colors, fonts, style) before writing CSS. |
| `map-codebase` | Builds `code-map.md`: for each feature, the path from entry point to database. |
| `parallel-prototypes` | Builds 2 or 3 versions of a design choice to compare. |
| `powershell-safe` | Safe string patterns for PowerShell scripts. |
| `product-risk` | Scores a product idea for risk, or helps you validate a new one. |
| `progress-report` | Shows numbers from your history: sessions, lessons, skill results. |
| `prototype-hypothesis` | Asks for a one-line hypothesis before each prototype change. |
| `refactoring-ui` | Practical fixes for interfaces that look off. |
| `scan-conventions` | Writes `coding-conventions.md` from what your code actually does. |
| `search-memory` | Broad memory search using helper agents. |
| `shadow-code` | You write the code first, then Claude compares. Keeps your own skills sharp. |
| `strategic-compact` | Decides if it is safe to compact a long chat. Say "should I compact?". |
| `ux-heuristics` | Checks usability using Nielsen's 10 heuristics. |

---

## The learning loop

When a skill gets something wrong and you correct it, that correction is logged. Every few sessions you ask Claude to fix the skills that keep failing.

```
session work
     |
/learn  ->  lessons.md        (patterns from this session)
        ->  skill_scores.md   (which step failed, what it made, what was needed)
        ->  velocity.md       (estimated vs actual time)
     |
/evolve-check  ->  groups failures by skill
               ->  marks skills with 2+ logged failures as ready
               ->  marks vague entries as missing data
     |
/evolve  ->  skips skills with only 1 failure
         ->  skips entries with no step number or detail
         ->  edits the exact failing step in the skill
         ->  builds new skills from repeated lessons
         ->  logs every change to skill_improvements.md
     |
better skills next session
```

How to use it:

1. Run `/learn` before `End Session` (End Session does this for you).
2. Every few sessions, run `/evolve-check`. It shows each skill as urgent, ready, stable or missing data.
3. When skills are flagged urgent or ready, run `/evolve`.

---

## Files that grow over time

| File | What it holds | Effect |
|------|--------------|--------|
| `lessons.md` | Patterns and fixes from `/learn` | Read at the start of each session. |
| `decisions.md` | Choices you have settled | Claude does not re-debate them. |
| `skill_scores.md` | Per-skill failure log | Used by `/evolve-check` and `/evolve`. |
| `regret.md` | Approaches you tried and rejected | Claude does not suggest them again. |
| `error-lookup.md` | Known error, cause and fix | Shown when you start debugging. |
| `velocity.md` | Estimated vs actual time per task | Makes estimates more realistic as it fills up. |
| `global-lessons.md` | Lessons that apply to every project | Loaded at Start Session. |

---

## Chaining skills

A skill can hand off to the next one by ending with an `## Auto-Chain` section. In this repo, `fix-bug` and `plan` have one. For example, `fix-bug` runs verification and then `guard` on its own.

To add a chain, add a section like this to the end of a skill:

```markdown
## Auto-Chain
After step 8, run the `guard` skill on the changed files.
```

To write your own skill, see [extending.md](extending.md).
