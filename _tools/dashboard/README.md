# Dev Dashboard

Live status dashboard for your Claude Code workflow.

## Setup

```bash
cd _tools/dashboard
node server.js
```

Open http://localhost:3030

## Config (environment variables)

| Variable | Default | Purpose |
|----------|---------|---------|
| `MEM_PATH` | `../../.claude/memory/` | Path to your memory folder |
| `REPO_PATH` | `../..` | Path to your git repo root |
| `HEALTH_URL` | _(empty)_ | URL to ping for server health (e.g. `http://localhost:3000`) |

Example:
```bash
MEM_PATH=/path/to/memory HEALTH_URL=http://localhost:8080 node server.js
```

## Features

- Session badge (reads from STATUS.md)
- Git status (clean/dirty, branch, last commit)
- Server health check (optional — set HEALTH_URL)
- Last Change (reads from STATUS.md)
- Saved Prompts (server-side storage, roams across machines via git)
- Quick Prompt builder (Target + Action → structured prompt → clipboard)
- Git Push button

## Saved Prompts

Prompts are stored in `prompts.json` (next to server.js). Commit this file to git so prompts roam across machines.

Default prompts seed on first load: Start, End, Smoke, Guard, Learn, Mem Push, Git Push.
