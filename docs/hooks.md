# Lifecycle Hooks

Hooks are what make Clankbrain work without you doing anything. A **hook** is a small script that Claude Code runs automatically at certain moments, such as when a session starts or after Claude edits a file. Clankbrain's hooks all call one Python file, `tools/memory.py`.

You do not need to read this page to use Clankbrain. Read it if you want to know what runs behind the scenes, turn something off, or fix a problem.

Example: you correct Claude by typing "no, use tabs, not spaces." A hook notices the correction and queues it. When Claude finishes its reply, another hook moves it into `lessons.md`, and Claude follows it next time.

---

## Where hooks live

Hooks are listed in `.claude/settings.json` in your project. Each entry says which moment to react to and which command to run. Setup creates this file for you.

There are two ways to install, and they set up different hooks:

| Installer | Hooks it writes |
|-----------|-----------------|
| `npx clankbrain` (runs `setup.py`) | The core set, listed in the first table below. |
| `python tools/memory.py --init` | A larger set that adds extra guards and logs, listed in the second table. |

If `.claude/settings.json` already exists, `--init` skips it and leaves your file alone.

---

## Core hooks (installed by setup.py)

| Moment | Commands that run | What happens |
|--------|-------------------|-------------|
| `SessionStart` (a session begins) | `--session-start`, `--check-expiry` | Loads your memory into the session, shows any interruption from last time, and warns about memories past their expiry date. |
| `UserPromptSubmit` (you send a message) | `--capture-correction` | Spots correction wording like "no, don't do that" and queues it for `/learn`. |
| `PostToolUse` on `Edit\|Write` (Claude just changed a file) | `--log-edit`, `--check-drift --silent` | Notes which file changed, then checks quietly whether your memory notes are now out of date. |
| `PreCompact` (before Claude shortens a long chat) | `--precompact` | Shows a memory checklist before older messages are compressed. |
| `PostCompact` (after that shortening) | `--postcompact` | Puts your memory back into the session so Claude does not forget it. |
| `Stop` (Claude finishes a reply) | `--process-corrections`, `--update-date`, `--journal`, `--stop-check` | Moves queued corrections into `lessons.md`, updates the date in `MEMORY.md`, adds a line to the session journal, and reminds you about unsaved memory and open plans. |

## Extra hooks (added by `memory.py --init`)

`--init` writes everything above, with a few differences, plus:

| Moment | Command | What happens |
|--------|---------|-------------|
| `UserPromptSubmit` | `--session-title` | Sets the session title to session number, open plans and open todos. Refreshes every 60 seconds. |
| `UserPromptSubmit` | `--regret-guard` | Warns if your message matches a rejected approach in `regret.md` or a settled choice in `decisions.md`. |
| `UserPromptSubmit` | `--decision-guard` | Warns if your plan goes against a settled decision. |
| `PreToolUse` on `Edit\|Write` (just before Claude changes a file) | `--pre-edit` | Finds memories about that file, including ones linked by `related:`, so Claude sees them first. |
| `PostToolUse` on `Edit\|Write` | `--verify-edit` | Asks Claude to quote the changed lines exactly. |
| `PostToolUse` on `Read\|Grep` | `--post-read` | Logs when Claude looks at a memory file. |
| `StopFailure` (the session ended by an error) | `--stop-failure` | Saves what was happening so the next session can pick it up. |
| `PermissionDenied` (you refused a tool request) | `--permission-denied` | Logs the tool and reason to `permission_denials.md` in your tasks folder. |

Both installers use the same `Stop` hook.

Some other `memory.py` commands exist for more hook types (`--file-changed`, `--subagent-start`, `--subagent-stop`, `--suggest-guards`, `--error-lookup`). Neither installer wires them. You can add them to `settings.json` yourself. See [extending.md](extending.md).

---

## Run any command by hand

Every hook command is also a normal terminal command:

```
python tools/memory.py --check-drift
```

You should see a short report, or a line saying nothing has drifted. Add `--silent` to hide routine output.

| Command | What it does |
|---------|-------------|
| `--session-start` | Loads memory into the session and runs a quiet health check. |
| `--check-expiry` | Lists memories past `valid_until` or not yet active. |
| `--capture-correction` | Queues correction wording from your message. |
| `--process-corrections` | Moves queued corrections into `lessons.md`. |
| `--regret-guard` | Matches your message against `regret.md` and `decisions.md`. |
| `--decision-guard` | Checks planning language against `decisions.md`. |
| `--error-lookup` | Matches debugging messages against `error-lookup.md` and shows the known fix. |
| `--session-title` | Builds the session title from `STATUS.md`, open plans and todos. |
| `--pre-edit` | Finds memories that match the file about to be edited. |
| `--log-edit` | Adds the edited file name to `draft-lessons.md`. |
| `--check-drift` | Finds code or CSS changes your memory does not mention. |
| `--verify-edit` | Asks for the changed lines to be quoted. |
| `--post-read` | Logs a memory file being read. |
| `--suggest-guards` | When `error-lookup.md` changes, suggests running Generate Guards. |
| `--precompact`, `--postcompact` | Handle the compaction moments above. |
| `--journal` | Adds a timestamped session summary. |
| `--stop-check` | Reminds you to save memory and shows open plans. |
| `--update-date` | Updates `currentDate` in `MEMORY.md`. |
| `--stop-failure` | Saves interruption state. |
| `--permission-denied` | Logs a denied tool request. |
| `--file-changed` | Alerts if `CLAUDE.md` or a memory file was changed outside Claude. |
| `--subagent-start`, `--subagent-stop` | Give helper agents your regret and decision notes, and log when they finish. |

On-demand commands (`--quick-learn`, `--kit-health`, `--guard-check`, `--search`, `--bootstrap` and others) are covered in [commands.md](commands.md).

---

## Troubleshooting

**Hooks do nothing.** Run `python tools/memory.py --kit-health`. It reports which hooks are wired and which are missing.

**Hooks are silently ignored in an old Claude Code.** Very old versions of Claude Code (for example 2.1.29) ignore every hook if `settings.json` contains an event name they do not know. Update Claude Code and the hooks start working. Run `claude --version` to see your version.

**A hook errors on Windows.** `memory.py` switches its output to UTF-8 so special characters do not crash it. If you still see errors, run the command by hand and read the message.

## Anonymous usage ping

When setup finishes and at each session start, `memory.py` sends one anonymous ping to PostHog. It contains a random ID, the install mode, your platform and your Python version. It contains no project data. Set the environment variable `CLANKBRAIN_NO_TELEMETRY=1` to turn it off. Your memory files and code stay on your machine unless you turn on sync.
