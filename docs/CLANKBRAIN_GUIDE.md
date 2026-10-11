# Clankbrain: Plain English Guide

Clankbrain gives Claude Code a memory. This guide is for anyone, including people who have never used Claude Code, and explains what each part of the kit does and why.

(Claude Code is Anthropic's coding assistant that runs in your terminal or editor. Each session starts with a fresh conversation. It carries knowledge forward only through files such as `CLAUDE.md` and its own auto memory notes.)

---

## The problem it solves

Claude Code already has memory: you can write instructions in `CLAUDE.md` and rules files, and Claude saves its own notes (called auto memory) from your corrections. It also provides hooks, skills and plan mode as building blocks, but not ready-made hooks.

Clankbrain fills in the rest. It adds hooks that are already wired up, separate memory files for lessons, decisions and rejected approaches, a routine for starting and ending sessions, and scored workflows. Think of Claude Code as the toolbox and Clankbrain as a set-up workbench.

If `CLAUDE.md` and auto memory are enough for you, you may not need it.

Your memory files and code stay on your computer, and no API keys are needed. Syncing memory to a private repo is optional and off by default.

The kit does send one anonymous usage ping (a random ID, the install mode, your platform, and your Python version, with no project data) when setup finishes and at each session start. To turn it off, set the environment variable `CLANKBRAIN_NO_TELEMETRY=1`.

---

## The 7 pieces

### 1. Memory files

Memory files are plain text files where Claude keeps notes about your project. They live in the `.claude/memory/` folder, and lessons, decisions and similar task files may sit in a top-level `tasks/` folder instead. You can open and edit them like any text file.

There is an index file called `MEMORY.md`. It lists the other files with a one-line description each. Claude reads the index first, then opens only the files that matter for the task.

Typical files:

| File | What it holds |
|------|---------------|
| `lessons.md` | Lessons learned from past sessions |
| `decisions.md` | Choices you settled, so they are not argued again |
| `project_status.md` | What is built and what is in progress |
| `user_preferences.md` | How you like Claude to work |

Tip: keep a `currentDate` line in `MEMORY.md`, like this:

```
# currentDate
Today's date is 2026-06-17. (Session 275)
```

Claude cannot tell what day it is on its own. This line lets it notice stale plans and how long ago things happened. The kit updates it for you when a session ends.

### 2. Hooks

A hook is a small script that Claude Code runs automatically at a certain moment. For example: when a session opens, or after Claude edits a file. You never run hooks yourself. They are how the kit does its work without you remembering to.

The installer sets up these six hooks:

| Hook | When it runs | What the kit does |
|------|--------------|-------------------|
| `SessionStart` | A session opens | Loads your memory and checks it is healthy |
| `UserPromptSubmit` | You send a message | Notices when you correct Claude and saves the correction |
| `PostToolUse` | After Claude edits or writes a file | Logs the file and checks that your notes still match your code |
| `PreCompact` | Before Claude shrinks a long conversation | Saves memory so it survives |
| `PostCompact` | After that shrinking | Puts memory back into the conversation |
| `Stop` | Claude finishes its turn | Updates the date, writes a journal entry, and reminds you to save memory |

(Shrinking a long conversation is called "compacting". Claude Code does it when the conversation gets too long.)

### 3. Skills

A skill is a saved set of instructions that Claude follows when you type a short command or say a trigger phrase. Instead of explaining a 10-step process each time, you type `/learn`.

Some of the skills that come with the kit:

| Skill | What it does |
|-------|-------------|
| `/learn` | Saves the lessons from the current session into memory |
| `/plan` | Writes a plan before any code is changed |
| `/search-first` | Makes Claude search your code for existing solutions before writing new code |
| `/guard` | Checks changed code against your list of known mistakes |
| `/evolve-check` | Reports which skills keep failing |
| `/evolve` | Rewrites the step of a skill that keeps failing |
| `/act` | Reads your open plans and suggests the best next step |

The kit holds 36 skills. The installer copies 19 core skills by default, or 7 on the Lite install. See [skills.md](skills.md) for the full list.

**How skills improve.** After a skill runs, `/learn` records whether it worked or needed a correction. Each result is one row in `skill_scores.md`. `/evolve-check` reads that log:

- URGENT: 3 or more unfixed failures, or 2 in a row on the same step.
- WATCH: 2 unfixed failures. Ready to fix.
- STABLE: 0 or 1 unfixed failures.

`/evolve` then opens the skill, rewrites only the step that failed, and marks those rows as fixed.

### 4. Agents

An agent here is a longer workflow that runs several steps in order and pauses to ask you at key points. The installer does not copy agents. Copy them from this repo's `.claude/agents/` folder (see [agents.md](agents.md)).

| Agent | Steps |
|-------|-------|
| `feature-build` | search, plan, implement, review, test, learn. It waits for your approval before coding. |
| `bug-fix` | reproduce, find the cause, fix, verify, log. |
| `end-session` | learn, update memory, check guards, sync. |

### 5. Plans

A plan is a short document written before any code changes. It says what will change, which files are touched, why it should work, and how to undo it. You read it and approve it first. Plans live in the `plans/` folder (or `.claude/memory/plans/`), one file per feature.

This stops Claude from quietly making the wrong change. The plan forces it to check its assumptions first.

### 6. Guard patterns

A guard is a named check for a mistake that already happened once. Each guard has a description and a way to search for the mistake. The list lives in `.claude/rules/guard-patterns.md`. This repo includes one, but setup does not create it, so copy it into your project if you want guards.

1. Something goes wrong in a session.
2. You or Claude add it to the guard list.
3. On later edits, Claude checks new code against the list.
4. If it finds a match, it flags it before the mistake happens again.

### 7. The Python tool

`tools/memory.py` is the script behind the hooks. It does the work: checking notes against code, writing the session journal, searching memory, and more. You rarely call it directly, but you can. For example:

```
python tools/memory.py --search "login bug"
```

You should see the memory files that best match the words you typed.

---

## What a session looks like

```
You open Claude Code and type: Start Session
  The SessionStart hook loads memory.
  Claude says what changed last time and asks what to work on.

You ask for a change
  Claude writes a plan and waits for your approval.
  You approve, and Claude edits the files.
  The PostToolUse hook logs the edit and checks your notes.

You type: End Session
  Claude saves lessons, updates STATUS.md, and finishes.
  The next session starts with all of it intact.
```

The two commands you need are `Start Session` and `End Session`. Type them as normal messages in Claude Code.

---

## With and without the kit

| Without the kit | With the kit |
|-----------------|--------------|
| Claude starts fresh every session | Claude reads your project notes first |
| You repeat the same instructions | Your rules are in memory and load on their own |
| The same mistake can happen twice | Guards flag known mistakes |
| Past decisions are forgotten | `decisions.md` and `regret.md` record them |
| Plans live only in the chat | Plans are written down and approved first |

The kit does not make Claude smarter. It makes your project's knowledge last from one session to the next. The value builds up over time as the notes grow.

---

## Where to go next

- [QUICKSTART.md](QUICKSTART.md): install and first session
- [hooks.md](hooks.md): hook details
- [skills.md](skills.md): all skills
- [architecture.md](architecture.md): how the pieces fit together
