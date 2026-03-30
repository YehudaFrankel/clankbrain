# FAQ

**What Claude plan do I need?**
Any paid plan that includes Claude Code. The kit has no plan requirements — it's plain markdown files and Python scripts. Longer sessions may benefit from Max due to context limits, but the PreCompact hook and `Start Session` recovery are specifically designed to handle those limits gracefully on any plan.

**Do I need to understand how it all works to use it?**
No. `Start Session` and `End Session` are the whole daily interface. Everything else runs automatically or responds to plain English descriptions.

**Does it work with any language or framework?**
Yes. Setup configures drift detection, skills, and memory for your actual stack. Java, Python, Node, Go, Ruby — any language with source files.

**What is user_preferences.md for?**
It's where Claude learns how you personally like to work — your communication style, things you never want it to do, coding conventions specific to you. It loads at every Start Session. Add anything: "always ask before refactoring", "never use semicolons", "I prefer short responses".

**What is global-lessons.md for?**
Lessons that aren't project-specific — things that apply across everything you build. Stored at `~/.claude/global-lessons.md` and loaded at Start Session on every project. Example: "always check .env before debugging auth issues."

**What does session_journal.md give me?**
A searchable history of every session — what files were edited, what phase you were in, timestamped automatically. You never write to it manually. Search it anytime: `Grep for "auth" in session_journal.md` to find every session where you worked on auth.

**What does --bootstrap do?**
`python tools/memory.py --bootstrap` scans your entire project and generates `quick_index.md` — a grouped map of every source file by type (Java, JS, CSS, SQL, etc.). Gives Claude immediate codebase awareness without any manual documentation. Run it once on any new project.

**Does this work with Anthropic's native Auto Memory?**
Yes — they solve different problems. Anthropic's Auto Memory captures conversational context within a session. Clankbrain persists project knowledge across sessions: codebase structure, architectural decisions, lessons from past mistakes, custom workflows. Auto Memory forgets when the session closes. Clankbrain doesn't. Run both — they complement each other.

**Why markdown files instead of a database?**
Files you can read, diff, commit, and recover without any tooling. Memory stored in a database is opaque — you can't grep it, review it in a PR, or restore a version from last Tuesday. Markdown files travel with your repo, work on any machine with zero setup, and never require an API key or running service. The constraint is the feature.

**Does a big CLAUDE.md actually help?**
No. Large monolithic CLAUDE.md files increase token use by ~20% with only a marginal improvement in output quality — sometimes negative. Clankbrain is built the opposite way: CLAUDE.md stays lean (commands and gotchas only), project knowledge lives in separate `.claude/memory/` files that load selectively. The CLAUDE.md template that ships with the kit enforces this — the project-specific section is designed to stay under 50 lines.

**Is this safe for business use?**
Clankbrain does nothing with your data — memory stays on your machine. Kit updates are pulled from Clankbrain to your machine — nothing goes the other direction. No telemetry, no analytics, no servers. Claude Code itself sends your prompts to Anthropic — that's separate from this kit. For regulated industries, use an Anthropic enterprise plan with a signed BAA. Clankbrain adds nothing to that data surface. GDPR: memory files are local, contain code patterns and decisions (not personal data), and are fully under your control.
