# Every Command

This page lists the commands you can use with Clankbrain. Most are short phrases you type into the Claude Code chat. A few are terminal commands you run yourself.

**Claude Code** is Anthropic's coding assistant that runs in your terminal or editor. **Clankbrain** adds a memory to it, stored as plain text files in your project. These commands are how you use that memory.

## Two ways to run a command

| Kind | Where you type it | Example |
|------|-------------------|---------|
| Chat phrase | The Claude Code chat box | `Start Session` |
| Terminal command | A normal terminal in your project folder | `python tools/memory.py --kit-health` |

Chat phrases starting with `/` (like `/learn`) are called slash commands. Each one runs a **skill**, which is a saved set of instructions Claude follows when you ask for a task. See [skills.md](skills.md).

If you only remember two commands, remember `Start Session` and `End Session`.

---

## Every day

| Command | What it does |
|---------|-------------|
| `Start Session` | Claude reads your memory files, reminds you of open plans, and says where you left off. |
| `End Session` | Claude runs `/learn`, updates `STATUS.md` (a short log of where the project stands), and saves memory. |
| `/learn` | Claude writes down what it learned this session. `End Session` runs it for you. |
| `/evolve-check` | Read-only report on which skills have been failing. It changes nothing. |
| `/evolve` | Fixes skills that failed 2 or more times, and turns repeated lessons into new skills. |
| `Plan [feature]` | Claude writes a plan with options and logs your decision. Example: `Plan add a login page`. |

Example:

```
You:    Start Session
Claude: Session 12 ready. Last change: added the invoice export. What are we working on?
```

---

## Memory

| Command | What it does |
|---------|-------------|
| `/recall [topic]` | Searches all memory files for a topic, such as `/recall why we chose SQLite`. |
| `/forget [topic]` | Marks a wrong or old memory as removed. The history is kept. |
| `Search Memory: [topic]` | Same search from the terminal: `python tools/memory.py --search "topic"` (add `--top 10` for more results). |

Quick checks, run in a terminal:

| Terminal command | What it does |
|------------------|-------------|
| `python tools/memory.py --quick-learn` | Saves a placeholder right away, then asks for 1 to 3 short lessons. |
| `python tools/memory.py --mempalace-audit` | Lists memory files that are missing a `## Source` block, a `valid_until` date, or the header block at the top. |
| `python tools/memory.py --check-expiry` | Lists memories past their `valid_until` date. Runs on its own at session start. |

### What a memory file looks like

Each memory is a short text file (markdown) with a header on top:

```markdown
---
name: short-id
description: one-line summary for the MEMORY.md index
type: rule
valid_from: 2026-01-01        # optional: not active before this date
valid_until: 2026-12-31       # needed for type: state
related: [other-memory.md]    # optional: linked memories
---

Use plain hyphens in text sent to the API.

**Why:** Fancy dashes showed up garbled.
**How to apply:** Check any string that goes to the API.

## Source
> The exact words from the chat that led to this memory.
— Session 12
```

- `## Source` keeps the original words next to the summary, so you can check why a memory exists later.
- `related:` links are followed one level deep before Claude edits a file. If `auth.js` is about to change and a memory about it links to another, Claude sees both.
- `valid_until` marks a fact that may go stale. Expired memories are left out of the pre-edit check.

| `type` | Use it for | Needs `valid_until`? |
|--------|-----------|----------------------|
| `rule` | A permanent coding or workflow rule | No |
| `correction` | A one-time fix so a mistake is not repeated | No |
| `decision` | A choice you have settled | No |
| `state` | Current phase or temporary facts | Yes |
| `reference` | A pointer to something outside, like a URL | Optional |
| `user` | Who you are and how you like to work | No |

### Smarter search (optional)

By default, `/recall` matches keywords. You can add search by meaning, which finds related notes even when the words differ. Everything runs on your computer and needs no account or API key.

1. Install the search library: `pip install sentence-transformers`
2. Build the index: `python tools/memory.py --build-index`
3. Try it: `python tools/memory.py --search-semantic "auth error on admin pages"`

The first run downloads a model of about 90 MB. It saves the index as `memory_embeddings.pkl` in your memory folder. Run `--build-index` again after you add many new memories. Add `--top 10` to see more results.

If something goes wrong, keyword search still works:

| Problem | What happens | Fix |
|---------|-------------|-----|
| Library not installed | `/recall` uses keyword search and shows no error. | Run `pip install sentence-transformers`. |
| Model download was cut off | `--build-index` fails. | Delete `~/.cache/huggingface/hub/models--sentence-transformers--all-MiniLM-L6-v2` and run it again. |
| `memory_embeddings.pkl` is damaged | `--search-semantic` prints an error. | Delete `.claude/memory/memory_embeddings.pkl` and run `--build-index` again. |

---

## Check and analyze

| Command | What it does |
|---------|-------------|
| `Check Drift` | Finds code that your memory notes do not mention yet, and notes that are out of date. Runs `python tools/memory.py --check-drift`. |
| `Guard Check` | Runs your saved "guards" (named checks for known mistakes, in `guard-patterns.md`) against the code. Prints PASS or FAIL for each. |
| `Pre-Ship Check` | Guard check, drift check, a count of files edited this session, and `git diff --stat`. |
| `Code Health` | Looks for leftover `console.log`, hard-coded values, dead code, missing error handling, and files over 500 lines. |
| `Kit Health` | Checks that Clankbrain is installed correctly: hooks, memory files, skills. Fix any FAIL right away. |
| `Progress Report` | Shows sessions, lessons, known errors and skill results from your real history. |
| `Estimate: [task]` | Claude reads the files and estimates how big and risky a task is. |
| `Analyze Codebase` | Scans your code files and updates memory with what it finds. |
| `/check-anthropic` | Reads the Claude Code release notes and docs and reports features you could use. |

More terminal-only reports:

| Terminal command | What it does |
|------------------|-------------|
| `python tools/memory.py --context-score` | Scores each section of `CLAUDE.md` by how often your session journals use it. Low scores are dead weight. |
| `python tools/memory.py --mine-patterns` | Groups your `lessons.md` entries to show mistakes that keep coming back. |
| `python tools/memory.py --velocity-estimate "task"` | Finds similar past tasks in `velocity.md` and shows how long they took. |
| `python tools/memory.py --memory-diff` | Shows which memory files changed this session. |

---

## Debugging and handoff

| Command | What it does |
|---------|-------------|
| `Debug Session` | Step-by-step bug hunt: reproduce, isolate, guess, fix, verify, log. Add a description: `Debug Session: login fails after timeout`. |
| `Mode [develop\|review\|safe\|deploy]` | Limits which tools Claude may use for the session. `review` is handy when you only want it to read code. |
| `Handoff` | Writes `HANDOFF.md`: current state, next tasks, decisions, known bugs, how to start. |

---

## Setup and updates

| Command | What it does |
|---------|-------------|
| `Setup Memory` | First-time setup. Runs `setup.py` if it is in your project. |
| `Install Memory` | For a new machine: scans the project, fills the memory files, and copies them to Claude's memory folder. |
| `Generate Skills` | Creates extra skills that fit your stack and file names. |
| `Generate Guards` | Proposes guards based on your error history. |
| `Upgrade to Full` | Moves a Lite install to the full install (runs `upgrade.py`). |
| `Update Kit` | Updates Clankbrain. Runs `update.py`. Asks first and does not touch your memory. |

---

## Sync and teams (optional)

Sync copies your memory to a private GitHub repository you own. It is off until you set it up. Details are in [sync.md](sync.md).

| Command | What it does |
|---------|-------------|
| `python sync.py setup [repo-url]` | One-time setup that points memory at your private repo. |
| `Sync Memory` | Pushes memory to your repo (`python sync.py push`). |
| `Pull Memory` | Pulls memory on a new machine (`python sync.py pull`). |
| `python sync.py status` | Shows what is waiting to sync. |
| `Setup Team [url]` | A manager runs this once to create the shared repo. |
| `Join Team [url]` | A new teammate runs this once with the manager's URL. |
| `Team Push` | Shares your lessons with the team. Run it at End Session. |
| `Team Status` | Shows last sync times and recent commits. |

Team Pull runs on its own at Start Session.

## Privacy note

Your memory files and code stay on your machine unless you turn on sync. Clankbrain does send one anonymous usage ping (a random ID, the install mode, your platform and Python version, with no project data) when setup finishes and at each session start. To turn it off, set the environment variable `CLANKBRAIN_NO_TELEMETRY=1`.
