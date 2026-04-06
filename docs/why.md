# Clankbrain — What It Does and Why It Matters

## The Problem

Claude Code is stateless. Every time you start a new session, it remembers nothing. Not what you built yesterday. Not the bug you spent three hours fixing last week. Not the architectural decision you made after debating it for two sessions. Not the approach you tried and rejected.

So every session, you re-explain. Claude re-suggests the same things. The same mistake happens twice. The same debate happens again. You are not building on yesterday. You are starting from zero every single time.

This is the problem Clankbrain solves.

---

## The Solution

Clankbrain gives Claude Code a living memory that grows with your project. Every session starts smarter than the last. Decisions stick. Mistakes don't repeat. Lessons compound.

Zero dependencies. Plain markdown files. Official Anthropic hooks and APIs only. Five minutes to set up.

---

## The Two Commands That Run Everything

### Start Session

You type two words and Claude arrives ready to work.

Behind the scenes: your memory files load, lessons from past sessions apply, open plans surface, pending corrections get flagged, and a silent health check runs.

**Before:** You open Claude Code and spend 10 minutes explaining your project, your stack, what you were working on last time, and what decisions were already made.

**After:** You type Start Session. Claude tells you exactly where you left off and what patterns to apply. You start working in under a minute.

### End Session

You type two words and everything compounds.

Behind the scenes: `/learn` extracts lessons from the session, skills get scored, STATUS.md updates with a summary, and memory pushes to git.

**Before:** You close Claude Code. Everything that happened this session is gone. Tomorrow you start from zero.

**After:** You type End Session. Lessons get extracted, memory updates, and everything pushes to your repo. Tomorrow Claude loads all of it automatically.

---

## How Each Piece Helps

### lessons.md — Grows Every Session

Claude fixes a bug, extracts a pattern, and forgets it the moment the session ends. Next session you are debugging the same class of problem from scratch.

With Clankbrain, `/learn` extracts lessons at the end of every session. These load automatically at every Start Session. By session 20, Claude knows your codebase's specific failure modes before you describe the problem.

### decisions.md — Stops Re-Debating Settled Questions

You spend two sessions debating approach A vs B, settle on A, then three sessions later Claude proposes B again because it has no memory of the debate.

Every architectural decision gets logged with context, rationale, and when it applies. Claude reads this before proposing any solution. Settled questions stay settled.

### error-lookup.md — Never Debug the Same Error Twice

You spend 45 minutes tracking down a specific error, find the fix, move on. Six sessions later the same error appears and you spend 45 minutes again.

Every debug session logs the root cause and exact fix. The error-lookup hook surfaces the known fix instantly before Claude starts investigating. One prompt instead of an hour.

### regret.md — Blocks Re-Proposing Rejected Approaches

You try an approach, it fails, you explain why and move on. Two weeks later Claude proposes the same approach again.

Rejected approaches get logged with exactly why they failed. The regret-guard hook scans every prompt against this file and injects a warning before Claude goes down the same path.

### Drift Detection — After Every File Edit

You make a change directly in your editor between sessions. Next session Claude has the wrong picture of your codebase. Plans get built on stale information.

The PostToolUse hook runs after every file edit and checks if Claude's memory index is stale. Undocumented changes get flagged before they cause problems downstream.

### velocity.md — Makes Estimates Honest

Claude estimates a task will take one session. It takes four. This keeps happening because there is no memory of past estimates vs reality.

Every task gets logged with estimated vs actual sessions. Claude reads this before estimating anything. Over time, estimates self-calibrate to your actual speed on your actual codebase.

---

## The Compound Learning Loop

This is what separates Clankbrain from a config file.

After every session, `/learn` scores each skill with structured failure data — not just Y or N, but which step failed, what it produced, and what was needed. `/evolve-check` reads those scores and surfaces which skills are ready to patch, flagging vague entries that cannot be acted on. `/evolve` reads the structured data, finds the specific steps that keep failing across multiple sessions, and patches them precisely.

The system requires patterns, not noise. A single failure does not trigger a rewrite. Two or more failures at the same step do.

By session 50, the skills Claude uses on your project have been refined by 50 sessions of real feedback. A generic skill becomes a skill calibrated to your exact stack, your exact patterns, your exact failure modes.

---

## What to Expect at Each Stage

### Sessions 1–3: Setup and Baseline

Small gains. The system is learning your project. Memory files are being populated and the first lessons are getting extracted. It does not feel transformative yet. That is normal.

### Sessions 4–10: Lessons Start Applying

Familiar errors surface faster. Decisions stop getting re-debated. Claude starts arriving with context instead of asking for it. You start noticing the sessions where it saves you time.

### Sessions 10–30: Real Compounding

Skills calibrate to your stack. Velocity estimates get accurate. Patterns become automatic. The error-lookup file starts paying off consistently. `/evolve-check` starts flagging skills with repeated failures. `/evolve` patches the specific steps that kept failing, with real failure data behind every change.

### Session 50 and Beyond

Claude knows your fragile functions, your rejected approaches, your architectural constraints, and your actual pace. It proposes solutions calibrated to your specific codebase. Re-explanation is near zero. The overhead is gone.

---

## The Three Rules That Make It Work

**Always run End Session.** If you skip it, lessons do not get extracted, skills do not get scored, and memory does not update. The compound loop only works if you close it.

**Run `/evolve-check` when you want to know what needs patching.** It reads skill_scores.md and shows you exactly which skills are urgent (🔴), ready to patch (🟡), stable (🟢), or missing the failure data needed to improve (⚠️). Takes five seconds. No files are changed.

**Run `/evolve` when skills are flagged.** Skills do not self-patch without it. `/learn` gathers the data. `/evolve-check` surfaces what needs attention. `/evolve` acts on it. All three have to happen.

Everything else is automatic. These three habits are what the system runs on.

---

## The Honest Part

Clankbrain is a system, not a plugin. It compounds with use but only if you use it. A developer who runs Start Session and End Session consistently and `/evolve` every few weeks will have a Claude that gets measurably better at their specific codebase over time. Someone who uses it sporadically gets marginal gains.

The habit is the product. The kit is what makes the habit stick.

---

## global-lessons.md — Learning That Crosses Every Project

Some lessons are not project-specific. They are things that are true everywhere you work.

Always check `.env` before debugging auth issues. Never force-push to main. Read the error message before searching Stack Overflow.

These belong in `global-lessons.md`, which lives at `~/.claude/global-lessons.md` on your machine. Clankbrain creates it on first install and loads it automatically at every Start Session across every project you work on.

The knowledge compounds not just within a project but across your entire development career.

---

## Handoff — Full Context in Two Minutes

When someone new joins a project, type `Handoff` and Claude produces `HANDOFF.md` covering the current state, the next three tasks, every settled architectural decision and why, known bugs, and gotchas not obvious from the code.

The new developer runs two commands, reads the doc, and is fully context-aware in under two minutes. The shared memory is the handoff. It grows automatically every session so it is always current without anyone having to write or maintain it.

---

## Getting Started

### Step 1: Install

Run this from your project root:

```
npx clankbrain
```

Choose Lite for zero dependencies and a single notes file. Choose Full for the complete system with drift detection, session journaling, and all memory files. You can upgrade from Lite to Full at any time.

### Step 2: Run Your First Start Session

Open Claude Code and type `Start Session`. Claude will scan your project and build the initial memory index. Everything from here compounds on top of it.

### Step 3: Do Real Work for One Session

Work on something actual. Fix a bug, build a feature, debug an error. Do not change your habits. Just work normally and let the system observe.

### Step 4: Run End Session

Type `End Session`. Watch `/learn` extract lessons from what just happened. Read what it captured. This is the first deposit in the compound account.

### Step 5: Start the Next Session

Type `Start Session` again. Notice what Claude already knows. Notice what you did not have to re-explain. This is the difference.

### Step 6: After Five Sessions, Type Progress Report

You will see real numbers built from your actual sessions — lessons accumulated, errors logged, skill accuracy, velocity data points. The compounding becomes visible and measurable.

---

*Built by Yehuda Frankel. Tested across 160+ real sessions on a production codebase.*
*[github.com/YehudaFrankel/clankbrain](https://github.com/YehudaFrankel/clankbrain)*
