#!/usr/bin/env python3
"""
Does Clankbrain change what Claude Code does? A repeatable A/B/C comparison.

Arms (same project, same scripted history, same fresh-session test tasks):
  bare    Claude Code with nothing added (auto memory, if it works headless, is the only memory)
  manual  a hand-written CLAUDE.md holding the same facts (what a careful user does without the kit)
  kit     a fresh Clankbrain install; the history runs through its real hooks

Each trial: build the arm, replay the history sessions (bare and kit only), then run fresh
test sessions that tempt Claude to break a rule it was told earlier. Four rules are graded
automatically: no `var`, two-space indent, no moment library, SQLite for storage.

Usage:
  python evaluation/run_eval.py --trials 1 --model sonnet          # pilot
  python evaluation/run_eval.py --trials 10 --model sonnet         # real run
Output goes to --out (default: evaluation/results/<timestamp>/): trials.jsonl and summary.md
Costs real money: every trial makes about 7 Claude calls (kit/bare) or 3 (manual).
"""

import argparse
import glob
import json
import math
import os
import re
import shutil
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path

KIT_ROOT = Path(__file__).resolve().parent.parent

# Replayed in order. Each states a rule as a correction, then asks for ordinary work.
HISTORY = [
    "No, that was wrong. In this project we never use var, always const or let, and we indent with 2 spaces. "
    "Please remember that. Now create src/add.js exporting a function add(a, b).",
    "No, don't use the moment library for dates. We rejected it because of bundle size. Use the plain Date object. "
    "Remember that. Now create src/dates.js exporting a function formatDate(d).",
    "We decided to use SQLite for storage, not Postgres. That is settled, please do not suggest other databases. "
    "Now create src/db.js with a function that opens the database.",
    "End Session",
]

# Fresh sessions. None of them mentions a rule.
TESTS = {
    "counter": "Create src/counter.js with a function that counts how often each item appears in an array and returns an object of counts.",
    "report": "Create src/report.js with a function that returns today's date formatted as YYYY-MM-DD.",
    "store": "Create src/store.js that saves a list of users to a database and loads them back.",
}

MANUAL_CLAUDE_MD = """# Project rules
- Never use `var`. Always use `const` or `let`.
- Indent with 2 spaces.
- Do not use the moment library (rejected for bundle size). Use the plain Date object.
- Storage is SQLite. This is settled. Do not suggest other databases.
"""

RULES = ["no_var", "two_space_indent", "no_moment", "sqlite"]


def find_claude():
    if os.environ.get("CLAUDE_BIN"):
        return os.environ["CLAUDE_BIN"]
    found = shutil.which("claude")
    if found:
        return found
    candidates = glob.glob(os.path.expanduser("~/.vscode/extensions/anthropic.claude-code-*/resources/native-binary/claude*"))
    if candidates:
        return sorted(candidates)[-1]
    sys.exit("Could not find the claude binary. Set CLAUDE_BIN.")


def call_claude(claude, cwd, prompt, model):
    """One headless session. Returns (json_result_or_None, seconds)."""
    cmd = [claude, "-p", prompt, "--output-format", "json", "--max-turns", "8",
           "--permission-mode", "acceptEdits", "--allowedTools", "Write", "Edit", "Read", "Glob", "Grep"]
    if model:
        cmd += ["--model", model]
    start = time.time()
    try:
        done = subprocess.run(cmd, cwd=cwd, stdin=subprocess.DEVNULL, capture_output=True,
                              text=True, encoding="utf-8", errors="replace", timeout=600)
        data = json.loads(done.stdout.strip().splitlines()[-1]) if done.stdout.strip() else None
    except Exception as err:
        data = {"error": str(err)}
    return data, time.time() - start


def build_arm(arm, trial_dir):
    if trial_dir.exists():
        shutil.rmtree(trial_dir)
    (trial_dir / "src").mkdir(parents=True)
    subprocess.run(["git", "init", "-q"], cwd=trial_dir)
    if arm == "manual":
        (trial_dir / "CLAUDE.md").write_text(MANUAL_CLAUDE_MD, encoding="utf-8")
    if arm == "kit":
        env = dict(os.environ, PYTHONIOENCODING="utf-8", CLANKBRAIN_NO_TELEMETRY="1")
        subprocess.run([sys.executable, str(KIT_ROOT / "setup.py")], cwd=trial_dir, input="n\n" + "\n" * 80,
                       capture_output=True, text=True, encoding="utf-8", errors="replace", env=env, timeout=240)


def read_new_code(trial_dir, before):
    """Concatenate the .js files that exist now but did not exist before the test."""
    text = ""
    for path in sorted((trial_dir / "src").glob("*.js")):
        if path.name not in before:
            text += path.read_text(encoding="utf-8", errors="replace") + "\n"
    return text


def grade(name, code):
    """Return {rule: True/False} for the rules this test can reveal; other rules are not graded."""
    out = {}
    if not code.strip():
        return out
    if name == "counter":
        out["no_var"] = re.search(r"\bvar\b", code) is None
        indents = [len(m.group(1).replace("\t", "    ")) for m in re.finditer(r"^([ \t]+)\S", code, re.M)]
        tabs = re.search(r"^\t", code, re.M) is not None
        out["two_space_indent"] = (not tabs) and bool(indents) and all(i % 2 == 0 for i in indents) and min(indents) == 2
    if name == "report":
        out["no_moment"] = re.search(r"moment", code, re.I) is None
    if name == "store":
        wants_sqlite = re.search(r"sqlite", code, re.I) is not None
        others = re.search(r"postgres|\bpg\b|mysql|mongo|redis|dynamodb", code, re.I) is not None
        out["sqlite"] = wants_sqlite and not others
    return out


def run_trial(claude, arm, trial, out_dir, model):
    trial_dir = out_dir / "work" / f"{arm}_{trial}"
    build_arm(arm, trial_dir)
    cost = 0.0
    calls = 0
    if arm in ("bare", "kit"):
        for prompt in HISTORY:
            data, _ = call_claude(claude, trial_dir, prompt, model)
            calls += 1
            cost += float((data or {}).get("total_cost_usd") or 0)
        # The history sessions wrote code that already follows the rules. Remove it so the tests
        # measure what was remembered, not what Claude can copy from files in front of it.
        for leftover in (trial_dir / "src").glob("*"):
            leftover.unlink()
    graded = {}
    for name, prompt in TESTS.items():
        before = {p.name for p in (trial_dir / "src").glob("*.js")}
        data, seconds = call_claude(claude, trial_dir, prompt, model)
        calls += 1
        cost += float((data or {}).get("total_cost_usd") or 0)
        graded.update(grade(name, read_new_code(trial_dir, before)))
    return {"arm": arm, "trial": trial, "graded": graded, "calls": calls, "cost_usd": round(cost, 4)}


def fisher_two_sided(a, b, c, d):
    """Fisher exact test for [[a, b], [c, d]] (a,b = successes/failures in group 1)."""
    n1, n2, k = a + b, c + d, a + c
    total = n1 + n2

    def pmf(x):
        return math.comb(n1, x) * math.comb(n2, k - x) / math.comb(total, k)
    observed = pmf(a)
    return min(1.0, sum(pmf(x) for x in range(max(0, k - n2), min(n1, k) + 1) if pmf(x) <= observed + 1e-12))


def summarize(rows):
    arms = sorted({r["arm"] for r in rows})
    lines = ["# Results", "", "Each cell is rules followed / rules graded.", ""]
    lines += ["| Arm | Trials | " + " | ".join(RULES) + " | Total | Cost (USD) |", "|---|---|" + "---|" * (len(RULES) + 2)]
    totals = {}
    for arm in arms:
        arm_rows = [r for r in rows if r["arm"] == arm]
        cells, ok_all, n_all = [], 0, 0
        for rule in RULES:
            vals = [r["graded"][rule] for r in arm_rows if rule in r["graded"]]
            cells.append(f"{sum(vals)}/{len(vals)}")
            ok_all += sum(vals)
            n_all += len(vals)
        totals[arm] = (ok_all, n_all - ok_all)
        cost = sum(r["cost_usd"] for r in arm_rows)
        lines.append(f"| {arm} | {len(arm_rows)} | " + " | ".join(cells) + f" | {ok_all}/{n_all} | {cost:.2f} |")
    lines += ["", "Fisher exact test on total rules followed (two-sided p):", ""]
    for first in arms:
        for second in arms:
            if first < second:
                p = fisher_two_sided(totals[first][0], totals[first][1], totals[second][0], totals[second][1])
                lines.append(f"- {first} vs {second}: p = {p:.3f}")
    lines += ["", "With only a few trials a difference is not evidence. Read the counts, not the p-values, until you have 10 or more trials per arm."]
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--trials", type=int, default=1)
    parser.add_argument("--arms", default="bare,manual,kit")
    parser.add_argument("--model", default="")
    parser.add_argument("--out", default="")
    args = parser.parse_args()

    claude = find_claude()
    out_dir = Path(args.out) if args.out else KIT_ROOT / "evaluation" / "results" / datetime.now().strftime("%Y%m%d-%H%M%S")
    out_dir.mkdir(parents=True, exist_ok=True)
    rows = []
    with open(out_dir / "trials.jsonl", "w", encoding="utf-8") as log:
        for trial in range(1, args.trials + 1):
            for arm in args.arms.split(","):
                row = run_trial(claude, arm, trial, out_dir, args.model)
                rows.append(row)
                log.write(json.dumps(row) + "\n")
                log.flush()
                print(f"trial {trial} {arm}: {row['graded']} (${row['cost_usd']}, {row['calls']} calls)")
    summary = summarize(rows)
    (out_dir / "summary.md").write_text(summary, encoding="utf-8")
    print("\n" + summary)
    print(f"\nFiles: {out_dir}")


if __name__ == "__main__":
    main()
