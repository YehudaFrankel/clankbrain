# FAQ

Short answers to common questions about Clankbrain, a kit that gives Claude Code a memory. It is for new and curious users. A **memory file** is a plain text file where Claude keeps notes about your project. A **hook** is a small script Claude Code runs automatically at certain moments, such as when a session starts.

---

## Basics

**Do I need to understand how it works?**
No. Typing `Start Session` and `End Session` is the whole daily routine. Everything else runs automatically or responds to plain English.

**What Claude plan do I need?**
Any plan that includes Claude Code. The kit is text files plus Python scripts that run on your computer. You need Python 3.7+ (and Node if you install with `npx clankbrain`).

**Does it work with my programming language?**
The memory files, skills and session commands work with any language, because they are plain text and instructions. One feature is narrower: automatic drift checking (noticing that your notes no longer match the code) reads only JavaScript and CSS files. For other languages it has nothing to check, and everything else still works.

**Does it work with Cursor or Windsurf?**
Partly. The installer can generate rule files for them with its `--ide` flag. Session commands and hooks are built for Claude Code. See [other-ides.md](other-ides.md).

## Memory files

**Why text files instead of a database?**
You can read them, search them, and compare versions in git. They travel with your project and need no running service.

**What is `user_preferences.md`?**
A file where you record how you like to work, such as "ask before refactoring" or "keep answers short." Claude reads it each session.

**What is `global-lessons.md`?**
Lessons that apply to every project, such as "check `.env` before debugging login problems." It lives at `~/.claude/global-lessons.md`.

**What is `session_journal.md`?**
An automatic, dated log of what you worked on. You never write to it. Ask Claude to search it, or search it yourself.

**What does bootstrap do?**
Run `python tools/memory.py --bootstrap` once. It lists your source files in `quick_index.md` so Claude can find them quickly.

**Does a long CLAUDE.md help?**
Not necessarily. A long file uses more of Claude's working space on every request. Clankbrain keeps `CLAUDE.md` short and puts details in separate memory files that Claude reads when needed.

## Compared with other tools

**Does it work with Claude's built-in Auto Memory?**
Yes. They can run side by side, and they overlap. Auto memory is notes Claude writes itself from your corrections and loads every session. Clankbrain adds ready-wired hooks and separate files you can read and edit, for lessons, decisions and rejected approaches, plus a start-and-end-of-session routine and scored skills. If auto memory is enough for you, you may not need Clankbrain.

**How is it different from other memory tools?**
Besides remembering, it tracks how well each skill works, lets you improve skills that fail repeatedly (`/evolve`), and records rejected approaches in `regret.md`. Whether that helps you more depends on how consistently you use it.

## Privacy and safety

**What stays on my computer, and what is sent?**
Memory files and your code stay on your computer. Clankbrain does not upload them. Syncing memory to a git repository is optional, and you choose the repository.

Clankbrain does send one small anonymous usage report to PostHog (an analytics service) when setup finishes and at each session start. It contains a random ID, the kit version, the install mode, your operating system, and your Python version. It has no project data, code, or file paths. To turn it off, set the environment variable `CLANKBRAIN_NO_TELEMETRY=1`.

**Is it safe for business use?**
The memory files hold code patterns and decisions and stay under your control. Separately, Claude Code itself sends your prompts to Anthropic, with or without this kit. If you work in a regulated field, check Anthropic's plans and agreements for that. Clankbrain does not change that.
