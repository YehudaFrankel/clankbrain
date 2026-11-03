# Install what you need

Do this once, before you use Clankbrain. Each step ends with a check you can run.

| You need | For | Required? |
|---|---|---|
| Claude Code | Everything | Yes |
| Python 3.7 or newer | The hooks and memory (`tools/memory.py`) | Yes |
| Git | Connecting memory to GitHub | Only for GitHub sync |
| Node.js | The `npx clankbrain` install | Only for that route |
| GitHub CLI (`gh`) | `setup.ps1` | Only for that script |

## 1. Claude Code

Install it from https://claude.ai/claude-code and follow the steps there.

## 2. Python (required)

**Windows**

1. Download Python from https://www.python.org/downloads/ (any version 3.7 or newer).
2. On the first installer screen, tick **Add python.exe to PATH**, then click Install.
3. Close and reopen your terminal (and Claude Code).
4. Check: `python --version` shows 3.7 or newer.

If typing `python` opens the Microsoft Store instead, turn that off: Settings > Apps > Advanced app settings > App execution aliases > switch off the two "python" entries, then check again.

**Mac**: install from python.org, or run `brew install python`. Check: `python3 --version`.

**Linux**: `sudo apt install python3` (Debian/Ubuntu). Check: `python3 --version`.

On Mac and Linux the command is `python3`. Choose "python3" in the wizard's Python command box.

## 3. Git (only for GitHub sync)

Download from https://git-scm.com/downloads. Check: `git --version`.

## 4. Node.js (only for `npx clankbrain`)

Download the LTS version from https://nodejs.org. Check: `node --version`.

## 5. GitHub CLI (only for setup.ps1)

Download from https://cli.github.com, then run `gh auth login`.

## Check that everything works

In your project folder run:

```
python tools/memory.py --kit-health
```

(`python3` on Mac and Linux.) You should see "0 fail". Warnings about `complexity_profile.md` and `lessons.md` are normal on a new install.

## If you see a hook error on every prompt

It usually means the hooks cannot find Python. Typical messages are "python is not recognized" or "command not found".

1. Install Python (step 2) and reopen your terminal and Claude Code.
2. On Mac or Linux, make sure the hooks say `python3`. In `.claude/settings.json`, replace `python tools/` with `python3 tools/`, or download again from the wizard with "python3" selected.
3. Run the check above.
