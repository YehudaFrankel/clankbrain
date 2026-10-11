# Other IDEs and Install Options

**What this is:** Clankbrain is built for Claude Code. This page says what you get in other tools, and lists other ways to install.

**Do you need it?** Only if you use Cursor, Windsurf or Codex, or if `npx clankbrain` does not work for you.

(An IDE is the program you write code in. A hook is a script Claude Code runs for you at set moments, such as after each edit.)

## What works where

| Tool | What you get |
|---|---|
| Claude Code | Everything: memory files, hooks, skills, commands |
| Codex | Memory files. The installer writes `AGENTS.md`, which Codex reads. |
| Cursor | Memory files plus one always-on rule file |
| Windsurf | Memory files plus one always-on rule file |
| GitHub Copilot | Not supported |

Hooks and skills work only in Claude Code. In other tools, read and update the memory files by hand, or ask the AI to. The installer always writes `CLAUDE.md` and `AGENTS.md` with the same content.

## Install for Cursor or Windsurf

```bash
npx clankbrain --ide cursor
npx clankbrain --ide windsurf
npx clankbrain --ide all
```

`all` does both. The flag adds one file to the normal install:

| Flag | File created | Setting inside |
|---|---|---|
| `--ide cursor` | `.cursor/rules/memory.mdc` | `alwaysApply: true` |
| `--ide windsurf` | `.windsurf/rules/memory.md` | `trigger: always_on` |

The file names your project and tech stack, lists the memory files to read at session start, and lists the session commands (Start Session, End Session, `remember:`, Check Drift). Any other `--ide` value creates no extra file.

## Other ways to install

`npx clankbrain` needs Node.js and Python 3.7 or newer. Without Node, use one of these.

**Clone and run:**
```bash
git clone https://github.com/YehudaFrankel/clankbrain.git
cd clankbrain
python setup.py
```

**Python one-liner (no Node):**
```bash
python -c "import urllib.request; exec(urllib.request.urlopen('https://raw.githubusercontent.com/YehudaFrankel/clankbrain/main/setup.py').read().decode())"
```
This downloads `setup.py` and runs it at once. Read the script first if you want to see what it does.

**No terminal:** paste this into Claude Code or Codex chat:
> Analyze this codebase and set up the Claude memory system. Scan all JS, CSS, and backend files. Create CLAUDE.md, STATUS.md, and .claude/memory/ pre-filled with what you find.
