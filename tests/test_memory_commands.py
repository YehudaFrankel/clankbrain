"""
tests/test_memory_commands.py — Tests for the runtime hook commands in tools/memory.py.

Covers: cmd_check_drift, cmd_bootstrap, cmd_search, cmd_precompact,
        cmd_process_corrections, cmd_kit_health, cmd_check_expiry,
        cmd_regret_guard, _last_meaningful_line.

Run:
  pytest tests/test_memory_commands.py -v
"""

import json
import sys
from pathlib import Path

import pytest

KIT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(KIT_ROOT / 'tools'))

import memory  # noqa: E402


# ─── FIXTURES ────────────────────────────────────────────────────────────────

@pytest.fixture
def kit(tmp_path):
    mem = tmp_path / '.claude' / 'memory'
    mem.mkdir(parents=True)
    (mem / 'tasks').mkdir()

    memory.ROOT       = tmp_path
    memory.SCRIPT_DIR = tmp_path / 'tools'

    return tmp_path


# ─── _last_meaningful_line ────────────────────────────────────────────────────

def test_last_meaningful_line_returns_last_non_blank(kit):
    mem = kit / '.claude' / 'memory'
    f = mem / 'notes.md'
    f.write_text('line1\nline2\n- New lesson added\n\n', encoding='utf-8')

    result = memory._last_meaningful_line(f, skip_lines=2)
    assert result == '- New lesson added'


def test_last_meaningful_line_skips_comments(kit):
    mem = kit / '.claude' / 'memory'
    f = mem / 'notes.md'
    f.write_text('existing\n- real entry\n<!-- comment -->\n', encoding='utf-8')

    result = memory._last_meaningful_line(f, skip_lines=1)
    assert result == '- real entry'


def test_last_meaningful_line_skips_headings(kit):
    mem = kit / '.claude' / 'memory'
    f = mem / 'notes.md'
    f.write_text('existing\n## New Section\n- actual content\n', encoding='utf-8')

    result = memory._last_meaningful_line(f, skip_lines=1)
    assert result == '- actual content'


def test_last_meaningful_line_truncates_long_lines(kit):
    mem = kit / '.claude' / 'memory'
    f = mem / 'notes.md'
    long_line = 'x' * 100
    f.write_text(f'existing\n{long_line}\n', encoding='utf-8')

    result = memory._last_meaningful_line(f, skip_lines=1)
    assert len(result) <= 83  # 80 chars + '...'
    assert result.endswith('...')


# ─── cmd_memory_diff (content) ───────────────────────────────────────────────

def test_memory_diff_shows_last_line(kit, capsys):
    mem = kit / '.claude' / 'memory'
    snap = {'lessons.md': 1}
    (mem / 'tasks' / 'session_snapshot.json').write_text(json.dumps(snap))
    (mem / 'lessons.md').write_text('# Lessons\n- Always use fAddQuotes\n', encoding='utf-8')

    memory.cmd_memory_diff()
    out = capsys.readouterr().out
    assert 'lessons.md +1' in out
    assert 'fAddQuotes' in out


def test_memory_diff_no_last_line_when_only_comments(kit, capsys):
    mem = kit / '.claude' / 'memory'
    snap = {'notes.md': 1}
    (mem / 'tasks' / 'session_snapshot.json').write_text(json.dumps(snap))
    (mem / 'notes.md').write_text('# Notes\n<!-- nothing here -->\n', encoding='utf-8')

    memory.cmd_memory_diff()
    out = capsys.readouterr().out
    assert 'notes.md +1' in out
    # No quoted content appended when only comments added
    assert '("' not in out


# ─── cmd_precompact ───────────────────────────────────────────────────────────

def test_precompact_outputs_json_hook_message(kit, capsys):
    mem = kit / '.claude' / 'memory'
    (mem / 'MEMORY.md').write_text('- [Notes](notes.md)\n', encoding='utf-8')

    memory.cmd_precompact()
    out = capsys.readouterr().out
    data = json.loads(out)
    assert 'hookSpecificOutput' in data
    assert 'PreCompact' in data['hookSpecificOutput']['hookEventName']
    assert 'BEFORE COMPACTING' in data['hookSpecificOutput']['additionalContext']


def test_precompact_includes_memory_index_entries(kit, capsys):
    mem = kit / '.claude' / 'memory'
    (mem / 'MEMORY.md').write_text('- [Lessons](lessons.md) — patterns\n', encoding='utf-8')

    memory.cmd_precompact()
    out = capsys.readouterr().out
    data = json.loads(out)
    assert 'Lessons' in data['hookSpecificOutput']['additionalContext']


# ─── cmd_process_corrections ─────────────────────────────────────────────────

def test_process_corrections_moves_queue_to_lessons(kit):
    mem = kit / '.claude' / 'memory'
    queue = mem / 'tasks' / 'corrections_queue.md'
    queue.write_text(
        '# Corrections Queue\n\n'
        '## 2026-04-05 14:00\n**Prompt:** "don\'t use jQuery here"\n',
        encoding='utf-8'
    )

    memory.cmd_process_corrections()

    lessons = mem / 'tasks' / 'lessons.md'
    assert lessons.exists()
    assert 'jQuery' in lessons.read_text()


def test_process_corrections_clears_queue(kit):
    mem = kit / '.claude' / 'memory'
    queue = mem / 'tasks' / 'corrections_queue.md'
    queue.write_text(
        '# Corrections Queue\n\n'
        '## 2026-04-05 14:00\n**Prompt:** "avoid globals"\n',
        encoding='utf-8'
    )

    memory.cmd_process_corrections()

    remaining = queue.read_text()
    assert 'avoid globals' not in remaining


def test_process_corrections_no_queue_no_crash(kit):
    memory.cmd_process_corrections()  # must not raise


# ─── cmd_bootstrap ────────────────────────────────────────────────────────────

def test_bootstrap_creates_quick_index(kit, capsys):
    (kit / 'app.py').write_text('def main(): pass\n', encoding='utf-8')

    memory.cmd_bootstrap()

    index = kit / '.claude' / 'memory' / 'quick_index.md'
    assert index.exists()
    content = index.read_text()
    assert 'app.py' in content
    assert 'Quick Index' in content


def test_bootstrap_registers_in_memory_md(kit, capsys):
    mem = kit / '.claude' / 'memory'
    (mem / 'MEMORY.md').write_text('# Memory Index\n', encoding='utf-8')
    (kit / 'main.js').write_text('function init() {}', encoding='utf-8')

    memory.cmd_bootstrap()

    memory_md = mem / 'MEMORY.md'
    assert 'quick_index.md' in memory_md.read_text()


def test_bootstrap_skips_node_modules(kit, capsys):
    nm = kit / 'node_modules' / 'lodash'
    nm.mkdir(parents=True)
    (nm / 'lodash.js').write_text('// lib', encoding='utf-8')
    (kit / 'src.js').write_text('function real() {}', encoding='utf-8')

    memory.cmd_bootstrap()

    index = (kit / '.claude' / 'memory' / 'quick_index.md').read_text()
    assert 'lodash.js' not in index
    assert 'src.js' in index


# ─── cmd_search ───────────────────────────────────────────────────────────────

def test_search_finds_matching_content(kit, capsys):
    mem = kit / '.claude' / 'memory'
    (mem / 'lessons.md').write_text(
        '# Lessons\n- Always use fAddQuotes for SQL\n', encoding='utf-8'
    )

    sys.argv = ['memory.py', '--search', 'fAddQuotes']
    memory.cmd_search()

    out = capsys.readouterr().out
    assert 'fAddQuotes' in out
    assert 'lessons.md' in out


def test_search_no_results_message(kit, capsys):
    mem = kit / '.claude' / 'memory'
    (mem / 'notes.md').write_text('# Notes\nSome content here\n', encoding='utf-8')

    sys.argv = ['memory.py', '--search', 'xyznotfound123']
    memory.cmd_search()

    out = capsys.readouterr().out
    assert 'No results' in out or out.strip() == '' or 'xyznotfound123' not in out


# ─── cmd_kit_health ───────────────────────────────────────────────────────────

def test_kit_health_passes_with_memory_md(kit, capsys):
    mem = kit / '.claude' / 'memory'
    (mem / 'MEMORY.md').write_text('# Memory Index\n', encoding='utf-8')
    (kit / 'STATUS.md').write_text('# Status\n', encoding='utf-8')

    memory.cmd_kit_health()

    out = capsys.readouterr().out
    # health output uses [✓] for pass, [X] for fail, [!] for warn
    assert 'MEMORY.md' in out
    assert '[X]' not in out.split('MEMORY.md')[0]  # MEMORY.md line is not a fail


def test_kit_health_fails_missing_memory_md(kit, capsys):
    # No MEMORY.md created — kit fixture only creates tasks/
    memory.cmd_kit_health()

    out = capsys.readouterr().out
    # MEMORY.md missing → [X] MEMORY.md in output
    assert 'MEMORY.md' in out
    assert '[X]' in out


# ─── cmd_check_expiry ────────────────────────────────────────────────────────

def test_check_expiry_flags_expired_file(kit, capsys):
    mem = kit / '.claude' / 'memory'
    expired = mem / 'old_context.md'
    expired.write_text(
        '---\nexpires: 2020-01-01\n---\nStale context\n', encoding='utf-8'
    )

    memory.cmd_check_expiry()

    out = capsys.readouterr().out
    data = json.loads(out)
    assert 'old_context.md' in data['systemMessage']
    assert '2020-01-01' in data['systemMessage']


def test_check_expiry_ignores_future_expiry(kit, capsys):
    mem = kit / '.claude' / 'memory'
    future = mem / 'upcoming.md'
    future.write_text(
        '---\nexpires: 2099-12-31\n---\nFuture context\n', encoding='utf-8'
    )

    memory.cmd_check_expiry()

    out = capsys.readouterr().out
    assert out.strip() == ''


def test_check_expiry_no_files_no_output(kit, capsys):
    memory.cmd_check_expiry()
    out = capsys.readouterr().out
    assert out.strip() == ''


# ─── cmd_regret_guard ────────────────────────────────────────────────────────

class _FakeStdinBytes:
    def __init__(self, payload: bytes):
        import io
        self.buffer = io.BytesIO(payload)


def test_regret_guard_warns_on_keyword_match(kit, monkeypatch, capsys):
    mem = kit / '.claude' / 'memory'
    (mem / 'tasks').mkdir(exist_ok=True)
    regret = mem / 'tasks' / 'regret.md'
    regret.write_text(
        '| Approach | Why Rejected |\n'
        '|---|---|\n'
        '| Using jQuery selector | TicTacWisdom uses Vanilla JS |\n',
        encoding='utf-8'
    )
    prompt = b'{"prompt": "can we use jQuery selector to find elements"}'
    monkeypatch.setattr('sys.stdin', _FakeStdinBytes(prompt))

    memory.cmd_regret_guard()

    out = capsys.readouterr().out
    assert out.strip()  # something printed
    data = json.loads(out)
    assert 'REGRET GUARD' in str(data)


def test_regret_guard_silent_on_no_match(kit, monkeypatch, capsys):
    mem = kit / '.claude' / 'memory'
    (mem / 'tasks').mkdir(exist_ok=True)
    regret = mem / 'tasks' / 'regret.md'
    regret.write_text(
        '| Approach | Why Rejected |\n'
        '|---|---|\n'
        '| Using jQuery | Vanilla JS project |\n',
        encoding='utf-8'
    )
    prompt = b'{"prompt": "what is the weather today"}'
    monkeypatch.setattr('sys.stdin', _FakeStdinBytes(prompt))

    memory.cmd_regret_guard()

    out = capsys.readouterr().out
    assert out.strip() == ''


def test_regret_guard_short_prompt_ignored(kit, monkeypatch, capsys):
    prompt = b'{"prompt": "hi"}'
    monkeypatch.setattr('sys.stdin', _FakeStdinBytes(prompt))

    memory.cmd_regret_guard()

    out = capsys.readouterr().out
    assert out.strip() == ''
