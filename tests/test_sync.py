"""
tests/test_sync.py — Tests for sync.py

Covers: config migration, health check, merge logic, personal sync, team sync.
Uses local git repos as fixtures — no network required.

Run:
  pip install pytest
  pytest tests/test_sync.py -v
"""

import json
import subprocess
import sys
import textwrap
from pathlib import Path

import pytest

# Add kit root to path so we can import sync directly
KIT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(KIT_ROOT))

import sync  # noqa: E402


# ─── FIXTURES ────────────────────────────────────────────────────────────────

@pytest.fixture
def kit(tmp_path):
    """
    A temporary kit root with .claude/memory/ and required subdirs.
    Patches sync module globals to point here.
    """
    memory = tmp_path / '.claude' / 'memory'
    memory.mkdir(parents=True)
    (memory / 'tasks').mkdir()
    (tmp_path / '.claude' / 'rules').mkdir(parents=True)

    # Patch module-level paths
    sync.ROOT          = tmp_path
    sync.MEMORY_DIR    = memory
    sync.CONFIG_FILE   = tmp_path / '.claude' / '.sync-config.json'
    sync.TEAM_REPO_DIR = tmp_path / '.claude' / 'team_repo'

    return tmp_path


@pytest.fixture
def bare_repo(tmp_path):
    """A bare git repo that acts as a remote."""
    repo = tmp_path / 'remote.git'
    repo.mkdir()
    subprocess.run(['git', 'init', '--bare', str(repo)], capture_output=True)
    return repo


@pytest.fixture
def team_remote(tmp_path):
    """A non-bare git repo that acts as the team remote (has an initial commit)."""
    repo = tmp_path / 'team_remote'
    repo.mkdir()
    subprocess.run(['git', 'init', str(repo)], capture_output=True)
    subprocess.run(['git', '-C', str(repo), 'config', 'user.email', 'test@test.com'], capture_output=True)
    subprocess.run(['git', '-C', str(repo), 'config', 'user.name', 'Test'], capture_output=True)
    (repo / 'decisions.md').write_text('| Decision | Why |\n|---|---|\n| Use UTC | Consistency |\n')
    (repo / 'lessons.md').write_text('| Lesson | Session |\n|---|---|\n| Always guard empties | 2 |\n')
    (repo / 'regret.md').write_text('| Approach | Why Rejected |\n|---|---|\n| SELECT * | Pulls IDENTITY cols |\n')
    subprocess.run(['git', '-C', str(repo), 'add', '-A'], capture_output=True)
    subprocess.run(['git', '-C', str(repo), 'commit', '-m', 'init'], capture_output=True)
    return repo


# ─── CONFIG MIGRATION ────────────────────────────────────────────────────────

def test_migrates_old_team_config(kit):
    """team_config.json is migrated into .sync-config.json on first load."""
    old = kit / '.claude' / 'team_config.json'
    old.write_text(json.dumps({
        'repo': 'https://github.com/team/mem',
        'last_pull': '2026-01-01 09:00',
        'last_push': '2026-01-02 10:00',
    }))

    cfg = sync.load_config()

    assert cfg.get('team_repo') == 'https://github.com/team/mem'
    assert cfg.get('team_last_pull') == '2026-01-01 09:00'
    assert cfg.get('team_last_push') == '2026-01-02 10:00'
    assert not old.exists(), 'old config should be renamed .migrated'
    assert (kit / '.claude' / 'team_config.json.migrated').exists()


def test_no_migration_when_team_already_in_sync_config(kit):
    """No migration if team_repo already in .sync-config.json."""
    sync.save_config({'repo': 'https://github.com/you/mem', 'team_repo': 'https://github.com/team/mem'})
    old = kit / '.claude' / 'team_config.json'
    old.write_text(json.dumps({'repo': 'https://github.com/team/OTHER'}))

    cfg = sync.load_config()

    assert cfg.get('team_repo') == 'https://github.com/team/mem'  # unchanged


# ─── HEALTH CHECK ────────────────────────────────────────────────────────────

def test_health_check_finds_existing_files(kit):
    memory = sync.MEMORY_DIR
    (memory / 'decisions.md').write_text('| Decision | Why |\n')
    (memory / 'tasks' / 'regret.md').write_text('| Approach | Why |\n')

    found, missing = sync.health_check()

    assert 'decisions.md' in found
    assert 'regret.md' in found
    missing_names = [m[0] for m in missing]
    assert 'lessons.md' in missing_names
    assert 'decisions.md' not in missing_names


def test_health_check_all_missing(kit):
    found, missing = sync.health_check()
    assert found == []
    assert len(missing) >= len(sync.TEAM_FILES)


def test_health_check_finds_guard_patterns(kit):
    gp = kit / '.claude' / 'rules' / 'guard-patterns.md'
    gp.write_text('## MY_GUARD\n- Check: something\n')

    found, missing = sync.health_check()

    assert 'guard-patterns.md' in found
    missing_names = [m[0] for m in missing]
    assert 'guard-patterns.md' not in missing_names


# ─── MERGE LOGIC ─────────────────────────────────────────────────────────────

def test_merge_table_appends_new_rows(kit, tmp_path):
    local = sync.MEMORY_DIR / 'decisions.md'
    local.write_text('| Decision | Why |\n|---|---|\n| Use UTC | Consistency |\n')

    remote = tmp_path / 'decisions.md'
    remote.write_text('| Decision | Why |\n|---|---|\n| Use UTC | Consistency |\n| Add indexes | Speed |\n')

    n = sync.merge_table(local, remote)

    assert n == 1
    content = local.read_text()
    assert 'Add indexes' in content
    assert content.count('Use UTC') == 1  # no duplicate


def test_merge_table_no_duplicates(kit, tmp_path):
    local = sync.MEMORY_DIR / 'decisions.md'
    local.write_text('| Decision | Why |\n|---|---|\n| Use UTC | Consistency |\n')

    remote = tmp_path / 'decisions.md'
    remote.write_text('| Decision | Why |\n|---|---|\n| Use UTC | Consistency |\n')

    n = sync.merge_table(local, remote)

    assert n == 0


def test_merge_table_creates_local_if_missing(kit, tmp_path):
    local  = sync.MEMORY_DIR / 'lessons.md'
    remote = tmp_path / 'lessons.md'
    remote.write_text('| Lesson | Session |\n|---|---|\n| Guard empties | 2 |\n')

    assert not local.exists()
    n = sync.merge_table(local, remote)

    assert n == 1
    assert local.exists()
    assert 'Guard empties' in local.read_text()


def test_merge_table_skips_header_keys(kit, tmp_path):
    local  = sync.MEMORY_DIR / 'decisions.md'
    local.write_text('| Decision | Why |\n|---|---|\n')
    remote = tmp_path / 'decisions.md'
    remote.write_text('| Decision | Why |\n|---|---|\n| Use UTC | Consistency |\n')

    n = sync.merge_table(local, remote)

    assert n == 1  # "Decision" header row skipped, data row added


def test_merge_guard_patterns_appends_new_guards(kit, tmp_path):
    local  = kit / '.claude' / 'rules' / 'guard-patterns.md'
    local.write_text('## EXISTING_GUARD\n- Check: existing\n')

    remote = tmp_path / 'guard-patterns.md'
    remote.write_text('## EXISTING_GUARD\n- Check: existing\n\n## NEW_GUARD\n- Check: new\n')

    n = sync.merge_guard_patterns(local, remote)

    assert n == 1
    content = local.read_text()
    assert 'NEW_GUARD' in content
    assert content.count('EXISTING_GUARD') == 1


def test_merge_guard_patterns_no_duplicates(kit, tmp_path):
    local  = kit / '.claude' / 'rules' / 'guard-patterns.md'
    local.write_text('## MY_GUARD\n- Check: something\n')

    remote = tmp_path / 'guard-patterns.md'
    remote.write_text('## MY_GUARD\n- Check: something\n')

    n = sync.merge_guard_patterns(local, remote)
    assert n == 0


# ─── REGRET PATH ─────────────────────────────────────────────────────────────

def test_regret_syncs_from_tasks_subdir(kit, tmp_path):
    """
    regret.md lives at memory/tasks/regret.md locally but is stored flat in team repo.
    Merging from team should correctly write to tasks/regret.md.
    """
    regret_local  = sync.MEMORY_DIR / 'tasks' / 'regret.md'
    regret_local.write_text('| Approach | Why Rejected |\n|---|---|\n| Existing | Reason |\n')

    remote_regret = tmp_path / 'regret.md'
    remote_regret.write_text('| Approach | Why Rejected |\n|---|---|\n| Existing | Reason |\n| New bad idea | It breaks |\n')

    n = sync.merge_table(regret_local, remote_regret)

    assert n == 1
    assert 'New bad idea' in regret_local.read_text()
    assert not (sync.MEMORY_DIR / 'regret.md').exists(), 'regret.md must not be created at memory root'


# ─── TEAM PULL (integration) ─────────────────────────────────────────────────

def test_team_pull_merges_from_repo(kit, team_remote):
    """team-pull clones team repo and merges new entries."""
    sync.TEAM_REPO_DIR.mkdir(parents=True)
    subprocess.run(
        ['git', 'clone', str(team_remote), str(sync.TEAM_REPO_DIR)],
        capture_output=True
    )

    # Set up local memory with one existing decisions entry
    decisions = sync.MEMORY_DIR / 'decisions.md'
    decisions.write_text('| Decision | Why |\n|---|---|\n| Existing | Already known |\n')

    sync.save_config({'team_repo': str(team_remote)})
    sync.cmd_team_pull()

    content = decisions.read_text()
    assert 'Use UTC' in content        # from team remote
    assert 'Existing' in content       # local entry preserved
    assert content.count('Use UTC') == 1  # not duplicated


def test_team_pull_creates_lessons_if_missing(kit, team_remote):
    """team-pull creates lessons.md locally if it doesn't exist yet."""
    sync.TEAM_REPO_DIR.mkdir(parents=True)
    subprocess.run(
        ['git', 'clone', str(team_remote), str(sync.TEAM_REPO_DIR)],
        capture_output=True
    )

    sync.save_config({'team_repo': str(team_remote)})
    sync.cmd_team_pull()

    lessons = sync.MEMORY_DIR / 'lessons.md'
    assert lessons.exists()
    assert 'Always guard empties' in lessons.read_text()


# ─── COPY TO REPO ─────────────────────────────────────────────────────────────

def test_copy_to_team_repo_uses_correct_local_paths(kit, tmp_path):
    """_copy_to_team_repo reads regret from tasks/ not memory root."""
    sync.TEAM_REPO_DIR.mkdir(parents=True)

    regret = sync.MEMORY_DIR / 'tasks' / 'regret.md'
    regret.write_text('| Approach | Why |\n|---|---|\n| Bad thing | It broke |\n')

    decisions = sync.MEMORY_DIR / 'decisions.md'
    decisions.write_text('| Decision | Why |\n')

    sync._copy_to_team_repo()

    assert (sync.TEAM_REPO_DIR / 'regret.md').exists()
    assert 'Bad thing' in (sync.TEAM_REPO_DIR / 'regret.md').read_text()
    assert not (sync.TEAM_REPO_DIR / 'tasks' / 'regret.md').exists()


# ─── COMPLEXITY PROFILE ──────────────────────────────────────────────────────

def test_team_pull_copies_complexity_profile_if_missing(kit, team_remote):
    """complexity_profile.md is copied from team if not present locally."""
    sync.TEAM_REPO_DIR.mkdir(parents=True)
    subprocess.run(
        ['git', 'clone', str(team_remote), str(sync.TEAM_REPO_DIR)],
        capture_output=True
    )

    # Add complexity_profile.md to team repo
    cp = sync.TEAM_REPO_DIR / 'complexity_profile.md'
    cp.write_text('# Complexity Profile\nScore: 7\n')

    sync.save_config({'team_repo': str(team_remote)})

    local_cp = sync.MEMORY_DIR / 'complexity_profile.md'
    assert not local_cp.exists()

    sync.cmd_team_pull()

    assert local_cp.exists()
    assert 'Score: 7' in local_cp.read_text()
