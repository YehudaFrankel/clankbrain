# Sync: Moving Memory Between Computers and Teammates

**What this is:** Clankbrain keeps your memory files in `.claude/memory/` on your own computer. "Sync" means copying them to a private GitHub repository (an online folder only you or your team can see) so another computer or a teammate can get them.

**Do you need it?** Only if you use more than one computer, want a backup, or work with a team. Otherwise skip this page. Sync is off until you turn it on.

**You need:** Python 3.7 or newer, `git`, and a GitHub account (or another git host). If git cannot log in, run `gh auth login`.

---

## Personal sync (your own computers)

### Set up once

1. Create a **private** repository at github.com/new. Leave it empty.
2. In Claude Code, type (with your own URL):

```
Setup Sync: https://github.com/you/my-memory
```

Or in a terminal: `python sync.py setup https://github.com/you/my-memory`

You should see `Personal sync set up.` If you see `Push failed`, the repo does not exist or git is not logged in.

### Every day

| In Claude Code | Terminal | What it does |
|---|---|---|
| `Sync Memory` | `python sync.py push` | Sends memory to your repo. Do it after End Session. |
| `Pull Memory` | `python sync.py pull` | Gets the latest memory. |
| `Sync Status` | `python sync.py status` | Shows what is not sent yet. |

Only `.claude/memory/` is synced. Your code is not.

### On a second computer

1. Get your project onto the machine (for example `git clone https://github.com/you/your-project`).
2. Run `python sync.py pull`.
3. Open Claude Code and type `Start Session`.

`pull` finds your memory repo's address in `.claude/.sync-config.json`, which `setup` created. That file must be in your project on the new machine.

### Avoid merge conflicts

A merge conflict is when two computers changed the same file and git cannot combine them. It is common here, because each computer adds its own lessons. To keep both sides' additions, run this once:

```bash
cd .claude/memory
echo "*.md merge=union" > .gitattributes
git add .gitattributes
git commit -m "Keep both sides when merging memory files"
git push
```

`merge=union` keeps every added line from both sides. `python sync.py pull` always merges (it never rebases), so that rule applies.

---

## Team sync

Team sync shares some memory files through one shared private repo. One person records a fix, and everyone gets it at their next Start Session.

### What is shared

`decisions.md`, `lessons.md`, `regret.md`, `error-lookup.md`, `critical-notes.md`, `agreed-flow.md`, `guard-patterns.md` and `complexity_profile.md`.

Not shared: `velocity.md`, `skill_scores.md`, `user_preferences.md`, `session_journal.md`, `todo.md`.

### How merging works

Merging only adds. For each shared file, a table row counts as new if its first column is not already in your copy. New rows go at the bottom. Existing rows are never changed or deleted, so a teammate's edit to an old row will not reach you.

### Manager: once

1. Create a **private** repo at github.com/new and make sure git is logged in.
2. In Claude Code, type:

```
Setup Team: https://github.com/team/shared-memory
```

Terminal: `python sync.py setup-team https://github.com/team/shared-memory`

This copies your shared files into the repo and prints a `python sync.py join ...` line. Send that line to your teammates.

### Teammates: once

```
Join Team: https://github.com/team/shared-memory
```

Terminal: `python sync.py join https://github.com/team/shared-memory`

It lists the files in the repo with line counts, then asks `Merge these into your local memory? (y/n)`. Nothing is added unless you answer `y`.

### Every day

| Command | What it does |
|---|---|
| Start Session | Runs `team-pull` for you. It prints anything new, or nothing if all is current. |
| `Team Push` (at End Session) | Shares your updates. Terminal: `python sync.py team-push` |
| `Team Status` | Shows last pull and push times. Terminal: `python sync.py team-status` |

To see the last 20 sync actions and any errors, run `python sync.py diagnose`.

---

## Privacy

- **Your repo.** Memory goes only to a private repo you create. You can delete it any time. Any git host works (GitLab, Bitbucket, a company server): use its URL.
- **Plain text.** Memory files are markdown. You can read them and restore old versions from git history. Keep passwords and customer data out of them.
- **Usage ping.** Separate from sync, Clankbrain sends one anonymous message to PostHog (an analytics service) when setup finishes and at each session start. It holds a random ID, the Clankbrain version, platform, Python version and install mode. It holds no project data or memory. To turn it off, set the environment variable `CLANKBRAIN_NO_TELEMETRY=1`.
- **Claude itself.** Claude Code sends your prompts to Anthropic. That is separate from this kit.
