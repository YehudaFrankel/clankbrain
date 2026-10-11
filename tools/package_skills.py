#!/usr/bin/env python3
"""
Package kit skills as one zip per skill for marketplace upload (e.g. Agensi).

Usage:
  python tools/package_skills.py                 # package the default standalone set
  python tools/package_skills.py --all           # package every live skill
  python tools/package_skills.py code-review plan  # package named skills

Output: dist/agensi/<name>.zip (skill folder is the zip root) + dist/agensi/MANIFEST.txt
Nothing is uploaded. Archived skills (_archived_*) are never packaged.
"""

import re
import sys
import zipfile
from pathlib import Path

KIT_ROOT = Path(__file__).resolve().parent.parent
SKILLS_DIR = KIT_ROOT / ".claude" / "skills"
OUT_DIR = KIT_ROOT / "dist" / "agensi"

# Skills that work on their own, without the kit's memory files.
DEFAULT_SKILLS = [
    "code-review", "fix-bug", "plan", "search-first",
    "verification-loop", "shadow-code",
]


def read_frontmatter(skill_dir):
    text = (skill_dir / "SKILL.md").read_text(encoding="utf-8", errors="replace")
    match = re.match(r"---\r?\n(.*?)\r?\n---", text, re.S)
    if not match:
        return None
    return match.group(1)


def field(frontmatter, key):
    match = re.search(r"^" + key + r":\s*(.+)$", frontmatter, re.M)
    if match:
        return match.group(1).strip()
    return None


def validate(skill_dir):
    """Return an error string, or None if the skill is packageable."""
    if not (skill_dir / "SKILL.md").is_file():
        return "no SKILL.md"
    frontmatter = read_frontmatter(skill_dir)
    if frontmatter is None:
        return "no frontmatter"
    name = field(frontmatter, "name")
    if name != skill_dir.name:
        return "name '" + str(name) + "' does not match folder"
    if not re.match(r"^[a-z0-9-]+$", name):
        return "name must be lowercase letters, numbers and hyphens"
    if not field(frontmatter, "description"):
        return "no description"
    return None


def package(skill_dir):
    zip_path = OUT_DIR / (skill_dir.name + ".zip")
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for path in sorted(skill_dir.rglob("*")):
            if path.is_file():
                zf.write(path, skill_dir.name + "/" + path.relative_to(skill_dir).as_posix())
    return zip_path


def main():
    args = sys.argv[1:]
    live = sorted(d.name for d in SKILLS_DIR.iterdir() if d.is_dir() and not d.name.startswith("_archived"))
    if "--all" in args:
        names = live
    elif args:
        names = args
    else:
        names = DEFAULT_SKILLS

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    manifest = []
    failed = 0
    for name in names:
        skill_dir = SKILLS_DIR / name
        if name not in live:
            print("SKIP " + name + ": not a live skill")
            failed += 1
            continue
        error = validate(skill_dir)
        if error:
            print("FAIL " + name + ": " + error)
            failed += 1
            continue
        zip_path = package(skill_dir)
        description = field(read_frontmatter(skill_dir), "description")
        manifest.append(name + " | " + zip_path.name + " | " + description)
        print("OK   " + name + " -> " + str(zip_path.relative_to(KIT_ROOT)))

    (OUT_DIR / "MANIFEST.txt").write_text("\n".join(manifest) + "\n", encoding="utf-8")
    print(str(len(manifest)) + " packaged, " + str(failed) + " failed")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
