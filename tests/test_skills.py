"""
tests/test_skills.py - Tests for the skills shipped in .claude/skills/

Covers: SKILL.md present, valid name/description frontmatter, name matches folder
for live skills, no duplicate names, curated install lists point at real skills,
README states the real Full-install skill count.

Run:
  pip install pytest
  pytest tests/test_skills.py -v
"""

import re
from pathlib import Path

import pytest

KIT_ROOT = Path(__file__).resolve().parent.parent
SKILLS_DIR = KIT_ROOT / ".claude" / "skills"


# --- HELPERS -----------------------------------------------------------------

def _skill_dirs():
    return sorted(d for d in SKILLS_DIR.iterdir() if d.is_dir())


def _frontmatter(skill_dir):
    """Return the frontmatter text of a skill's SKILL.md, or None if missing."""
    text = (skill_dir / "SKILL.md").read_text(encoding="utf-8", errors="replace")
    match = re.match(r"---\r?\n(.*?)\r?\n---", text, re.S)
    if match:
        return match.group(1)
    return None


def _field(frontmatter, key):
    match = re.search(r"^" + key + r":\s*(.+)$", frontmatter, re.M)
    if match:
        return match.group(1).strip()
    return None


def _curated(list_name):
    """Parse a *_CURATED_SKILLS list out of setup.py without importing it."""
    text = (KIT_ROOT / "setup.py").read_text(encoding="utf-8", errors="replace")
    block = re.search(list_name + r"\s*=\s*\[(.*?)\n\]", text, re.S).group(1)
    return re.findall(r"'([a-z0-9-]+)'", block)


# --- TESTS -------------------------------------------------------------------

@pytest.mark.parametrize("skill_dir", _skill_dirs(), ids=lambda d: d.name)
def test_skill_has_valid_frontmatter(skill_dir):
    assert (skill_dir / "SKILL.md").is_file(), "missing SKILL.md"
    frontmatter = _frontmatter(skill_dir)
    assert frontmatter is not None, "no frontmatter block"
    name = _field(frontmatter, "name")
    assert name, "frontmatter has no name"
    assert _field(frontmatter, "description"), "frontmatter has no description"
    if not skill_dir.name.startswith("_archived"):
        assert name == skill_dir.name, "name does not match folder"


def test_skill_names_are_unique():
    seen = {}
    for skill_dir in _skill_dirs():
        name = _field(_frontmatter(skill_dir), "name")
        seen.setdefault(name, []).append(skill_dir.name)
    duplicates = {n: dirs for n, dirs in seen.items() if len(dirs) > 1}
    assert not duplicates, "duplicate skill names: " + str(duplicates)


@pytest.mark.parametrize("list_name", ["FULL_CURATED_SKILLS", "LITE_CURATED_SKILLS"])
def test_curated_skills_exist(list_name):
    names = _curated(list_name)
    assert names, list_name + " parsed as empty"
    for skill in names:
        assert (SKILLS_DIR / skill / "SKILL.md").is_file(), skill + " is listed but missing"


def test_readme_states_full_install_skill_count():
    count = len(_curated("FULL_CURATED_SKILLS"))
    readme = (KIT_ROOT / "README.md").read_text(encoding="utf-8", errors="replace")
    assert str(count) + " core workflows" in readme, "README does not state " + str(count) + " core workflows"


def test_readme_states_repo_skill_count():
    live = len([d for d in _skill_dirs() if not d.name.startswith("_archived")])
    readme = (KIT_ROOT / "README.md").read_text(encoding="utf-8", errors="replace")
    assert "(" + str(live) + " in the repo)" in readme, "README does not state " + str(live) + " in the repo"
