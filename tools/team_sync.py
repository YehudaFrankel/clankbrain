#!/usr/bin/env python3
"""
team_sync.py — MOVED to sync.py

Team sync commands are now part of sync.py. This file redirects for backwards compatibility.

Old command → New command:
  python tools/team_sync.py setup-team <url>  →  python sync.py setup-team <url>
  python tools/team_sync.py join <url>         →  python sync.py join <url>
  python tools/team_sync.py pull-team          →  python sync.py team-pull
  python tools/team_sync.py push-team          →  python sync.py team-push
  python tools/team_sync.py team-status        →  python sync.py team-status
"""

import subprocess
import sys
from pathlib import Path

SYNC_PY = Path(__file__).resolve().parent.parent / 'sync.py'

# Map old commands → new commands
COMMAND_MAP = {
    'setup-team': 'setup-team',
    'join':        'join',
    'pull-team':   'team-pull',
    'push-team':   'team-push',
    'team-status': 'team-status',
}

args = sys.argv[1:]
if not args:
    print(__doc__)
    sys.exit(0)

old_cmd = args[0]
new_cmd = COMMAND_MAP.get(old_cmd)

if new_cmd is None:
    print(f'Unknown command: {old_cmd}')
    print(__doc__)
    sys.exit(1)

new_args = [new_cmd] + args[1:]
print(f'[team_sync.py is now sync.py — running: python sync.py {" ".join(new_args)}]')

result = subprocess.run([sys.executable, str(SYNC_PY)] + new_args)
sys.exit(result.returncode)
