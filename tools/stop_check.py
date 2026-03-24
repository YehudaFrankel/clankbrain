#!/usr/bin/env python3
"""
Claude Code Stop hook — warns about unsaved memory and open plans.

Shows reminders ONLY when action is needed — silent otherwise.
Output: JSON with systemMessage (shown in Claude UI) or nothing at all.
Hook event: Stop (fires when Claude finishes responding)

No configuration needed — auto-detects memory directory.
No git required — works with any sync method or no sync at all.
"""

import json
import re
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parent
ROOT = SCRIPT_DIR.parent


def find_memory_dir():
    """Auto-detect the .claude/memory directory."""
    for path in ROOT.rglob('MEMORY.md'):
        if '.claude' in path.parts:
            return path.parent
    return ROOT / '.claude/memory'


def has_unsaved_changes(memory_dir):
    """
    Check for unsaved memory changes.
    Strategy 1: git status (if available)
    Strategy 2: mtime comparison against STATUS.md (fallback for non-git users)
    """
    try:
        import subprocess
        result = subprocess.run(
            ['git', '-C', str(memory_dir), 'status', '--porcelain'],
            capture_output=True, text=True, timeout=5
        )
        if result.returncode == 0:
            return bool(result.stdout.strip())
    except Exception:
        pass

    status_file = ROOT / 'STATUS.md'
    if not status_file.exists():
        return False
    try:
        status_mtime = status_file.stat().st_mtime
        for md_file in memory_dir.rglob('*.md'):
            if md_file.stat().st_mtime > status_mtime:
                return True
    except Exception:
        pass

    return False


def get_open_plans(memory_dir):
    """
    Scan plans/ for Draft or On Hold plans that have unresolved open questions.
    Returns list of (name, status, open_question_count).
    """
    plans_dir = memory_dir / 'plans'
    if not plans_dir.exists():
        return []

    open_plans = []
    for plan_file in sorted(plans_dir.glob('*.md')):
        if plan_file.name.startswith('_'):
            continue
        try:
            text = plan_file.read_text(encoding='utf-8')

            # Check status
            status_match = re.search(r'\*\*Status:\*\*\s*(.+)', text)
            if not status_match:
                continue
            status = status_match.group(1).strip()
            if status not in ('Draft', 'On Hold'):
                continue

            # Count unchecked open questions
            open_q = len(re.findall(r'^- \[ \] .+', text, re.MULTILINE))
            if open_q > 0:
                name = plan_file.stem.replace('-', ' ').title()
                open_plans.append((name, status, open_q))
        except Exception:
            continue

    return open_plans


def main():
    memory_dir = find_memory_dir()
    if not memory_dir.exists():
        return

    messages = []

    if has_unsaved_changes(memory_dir):
        messages.append('Memory has unsaved changes. Type "End Session" to save.')

    open_plans = get_open_plans(memory_dir)
    for name, status, count in open_plans:
        q = 'question' if count == 1 else 'questions'
        messages.append(f'Open plan: {name} ({status}) — {count} {q} unresolved.')

    if messages:
        print(json.dumps({'systemMessage': ' | '.join(messages)}))


if __name__ == '__main__':
    main()
