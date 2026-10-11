"""
tests/test_memory_paths.py - Tests for tasks/ resolution, token estimate scoping,
drift exclusion, and the hooks that setup.py installs.

Run:
  pip install pytest
  pytest tests/test_memory_paths.py -v
"""

import json
import os
import subprocess
import sys
from pathlib import Path

import pytest

KIT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(KIT_ROOT / 'tools'))

import memory  # noqa: E402


@pytest.fixture
def project(tmp_path):
    mem = tmp_path / '.claude' / 'memory'
    mem.mkdir(parents=True)
    memory.ROOT = tmp_path
    return tmp_path


# --- find_tasks_dir ----------------------------------------------------------

def test_tasks_dir_keeps_memory_tasks_when_it_has_files(project):
    mem = project / '.claude' / 'memory'
    (mem / 'tasks').mkdir()
    (mem / 'tasks' / 'lessons.md').write_text('x', encoding='utf-8')
    (project / 'tasks').mkdir()
    (project / 'tasks' / 'lessons.md').write_text('y', encoding='utf-8')
    assert memory.find_tasks_dir(mem) == mem / 'tasks'


def test_tasks_dir_uses_root_tasks_from_setup_py(project):
    mem = project / '.claude' / 'memory'
    (project / 'tasks').mkdir()
    (project / 'tasks' / 'corrections_queue.md').write_text('y', encoding='utf-8')
    assert memory.find_tasks_dir(mem) == project / 'tasks'


def test_tasks_dir_falls_back_to_memory_tasks(project):
    mem = project / '.claude' / 'memory'
    assert memory.find_tasks_dir(mem) == mem / 'tasks'


def test_tasks_dir_empty_memory_tasks_does_not_hide_root_tasks(project):
    mem = project / '.claude' / 'memory'
    (mem / 'tasks').mkdir()
    (project / 'tasks').mkdir()
    (project / 'tasks' / 'lessons.md').write_text('y', encoding='utf-8')
    assert memory.find_tasks_dir(mem) == project / 'tasks'


# --- searchable files --------------------------------------------------------

def test_search_includes_root_tasks(project):
    mem = project / '.claude' / 'memory'
    (mem / 'MEMORY.md').write_text('index', encoding='utf-8')
    (project / 'tasks').mkdir()
    (project / 'tasks' / 'lessons.md').write_text('use const', encoding='utf-8')
    names = [p.name for p in memory._searchable_md_files(mem)]
    assert 'lessons.md' in names and 'MEMORY.md' in names


def test_cmd_search_finds_root_tasks_without_crashing(project, monkeypatch, capsys):
    mem = project / '.claude' / 'memory'
    (mem / 'MEMORY.md').write_text('index', encoding='utf-8')
    (project / 'tasks').mkdir()
    (project / 'tasks' / 'lessons.md').write_text('always use two-space indent', encoding='utf-8')
    monkeypatch.setattr(sys, 'argv', ['memory.py', '--search', 'indent'])
    memory.cmd_search()
    out = capsys.readouterr().out
    assert 'lessons.md' in out and 'indent' in out


def test_search_does_not_duplicate_memory_tasks(project):
    mem = project / '.claude' / 'memory'
    (mem / 'tasks').mkdir()
    (mem / 'tasks' / 'lessons.md').write_text('x', encoding='utf-8')
    names = [p.name for p in memory._searchable_md_files(mem)]
    assert names.count('lessons.md') == 1


# --- token estimate ----------------------------------------------------------

def test_token_estimate_ignores_other_projects(project, tmp_path, monkeypatch):
    home = tmp_path / 'home'
    other = home / '.claude' / 'projects' / 'some-other-project'
    other.mkdir(parents=True)
    (other / 'big.jsonl').write_text('x' * 2_000_000, encoding='utf-8')
    monkeypatch.setattr(Path, 'home', classmethod(lambda cls: home))
    assert memory._journal_estimate_tokens() == (0, 0, '')


def test_token_estimate_reads_this_project(project, tmp_path, monkeypatch):
    home = tmp_path / 'home'
    encoded = ''.join(c if c.isalnum() else '-' for c in str(project))
    mine = home / '.claude' / 'projects' / encoded
    mine.mkdir(parents=True)
    (mine / 's.jsonl').write_text('x' * 400_000, encoding='utf-8')
    monkeypatch.setattr(Path, 'home', classmethod(lambda cls: home))
    tokens, pct, _ = memory._journal_estimate_tokens()
    assert tokens == 100000 and pct == 50


# --- drift exclusion ---------------------------------------------------------

def test_drift_excludes_kit_dashboard_only():
    assert memory._drift_is_excluded(Path('_tools/dashboard/app.js'))
    assert not memory._drift_is_excluded(Path('src/app.js'))
    assert not memory._drift_is_excluded(Path('_tools/helpers.js'))


# --- hooks written by setup.py ----------------------------------------------

def test_setup_py_installs_session_and_date_hooks(tmp_path):
    answers = 'n\n' + '\n' * 80
    env = dict(os.environ, PYTHONIOENCODING='utf-8')
    result = subprocess.run(
        [sys.executable, str(KIT_ROOT / 'setup.py')],
        cwd=tmp_path, input=answers, capture_output=True, text=True,
        encoding='utf-8', errors='replace', env=env, timeout=120,
    )
    assert result.returncode == 0, result.stderr[-500:]
    settings = json.loads((tmp_path / '.claude' / 'settings.json').read_text(encoding='utf-8'))
    hooks = settings['hooks']
    for event in ('SessionStart', 'UserPromptSubmit', 'PostToolUse', 'PreCompact', 'PostCompact', 'Stop'):
        assert event in hooks, event + ' hook missing'
    stop_commands = ' '.join(h['command'] for g in hooks['Stop'] for h in g['hooks'])
    assert '--update-date' in stop_commands
    start_commands = ' '.join(h['command'] for g in hooks['SessionStart'] for h in g['hooks'])
    assert '--session-start' in start_commands
    # the journal only records edits that --log-edit has logged
    edit_commands = ' '.join(h['command'] for g in hooks['PostToolUse'] for h in g['hooks'])
    assert '--log-edit' in edit_commands


# --- npx scenario: setup.py runs alone, without the rest of the kit -----------

def _github_reachable():
    try:
        import urllib.request
        urllib.request.urlopen('https://github.com', timeout=5)
        return True
    except Exception:
        return False


@pytest.mark.skipif(not _github_reachable(), reason='needs network access to GitHub')
def test_setup_py_alone_downloads_the_rest_of_the_kit(tmp_path):
    """`npx clankbrain` runs a lone setup.py; it must still install tools/memory.py and the core skills."""
    standalone = tmp_path / 'standalone'
    standalone.mkdir()
    (standalone / 'setup.py').write_text((KIT_ROOT / 'setup.py').read_text(encoding='utf-8'), encoding='utf-8')
    project = tmp_path / 'project'
    project.mkdir()
    env = dict(os.environ, PYTHONIOENCODING='utf-8', CLANKBRAIN_NO_TELEMETRY='1')
    result = subprocess.run(
        [sys.executable, str(standalone / 'setup.py')],
        cwd=project, input='n\n' + '\n' * 80, capture_output=True, text=True,
        encoding='utf-8', errors='replace', env=env, timeout=240,
    )
    assert result.returncode == 0, result.stderr[-400:]
    assert (project / 'tools' / 'memory.py').exists(), 'hooks would fail: tools/memory.py missing'
    assert len(list((project / '.claude' / 'skills').iterdir())) >= 19
