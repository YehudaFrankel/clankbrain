# Changelog

## v2.10.0 (2026-08-28) — Feedback memories + comment-changes rule

### Added
- **Feedback memory type** — documented in MEMORY.md. Corrections and confirmations from the user saved as persistent rules (`feedback_*.md`). Each prevents the same mistake from recurring across sessions.
- **`rules/comment-changes.md`** — every code change must have a clear short comment. Auto-loaded via CLAUDE.md.

### Changed
- **CLAUDE.md** — added `@rules/comment-changes.md` to auto-loaded rules.
- **MEMORY.md** — added Feedback Memories section with format guide and examples.

## v2.9.0 (2026-05-11) — Full install ships 21 skills; Lite ships 5

### Changed
- **Full install** now copies 16 curated skills verbatim from the kit (learn, smart-resume, recall, forget, plan, search-first, debug-session, skill-creator, mode, fix-bug, guard, verification-loop, tour, kit-health, evolve, evolve-check) plus generates 5 project-scaffolded templates (security-check, new-feature, environment-check, run-verification, refactor). Previously shipped 7 thin generated stubs.
- **Lite install** copies 4 core skills (learn, smart-resume, recall, fix-bug) plus generates code-review. Separate `generate_lite_skills()` function — Lite and Full no longer share skill generation.
- Kit skills are copied verbatim — they stay up to date automatically when the user runs `Update Kit`.
- README skill table updated to reflect what actually ships (removed TicTacWisdom-specific skills 07-refactoring, 03-security, 04-environments, 06-testing from the "what you get" description).

### Fixed
- `setup.py` crashed on Windows with `UnicodeEncodeError` after writing all files — box-drawing characters in the Done banner couldn't encode in cp1252. Added `sys.stdout.reconfigure(encoding='utf-8')` at startup (same fix `memory.py` already had).

### Added
- `test-install.ps1` — 63-check install verifier. Creates a dummy project in a temp folder, runs the installer non-interactively, checks all files/hooks/content/functional commands, then cleans up. Run any time to confirm a clean install works end-to-end.

## v2.8 (2026-04-16) — Onboarding Pass

### Added — make the magic obvious in the first 10 minutes
- **`skills/kit-health/`** — confirms install worked. Run after `setup.py` to see green checks for memory directory, skills loaded, hooks active, settings valid. No more silent installs.
- **`skills/tour/`** — interactive 5-minute walkthrough that demonstrates memory, regret log, skills, and build modes by walking the user through them step-by-step. New users feel the magic instead of reading about it.
- **`CHEATSHEET.md`** — one page, 5 daily commands. Print/screenshot/keep open. Replaces "I have to read 4 docs to remember the basics."

### Changed — `setup.py` error messages are now actionable
- Pre-flight check before main(): Python version (3.7+), writable directory, ~/.claude existence, settings.json conflict detection, OneDrive warning on Windows
- Wrapped `__main__` in try/except — KeyboardInterrupt is graceful, unknown errors get pattern-matched to specific fixes
- Error messages now say: what failed, likely cause, exact command to fix
- Common errors covered: PermissionError, FileNotFoundError, JSONDecodeError, encoding (cp1252 vs UTF-8 on Windows)

### Why
8/10 install rating → 10/10. New users had no confirmation install worked, didn't know what to do first, and saw raw Python tracebacks when things failed. All three solved.

## v2.7 (2026-04-16) — Build to Learn vs Build to Earn

### Added — Cagan-inspired discovery/delivery split
- **`rules/build-mode.md`** — explicit mode declaration at session start. Discovery (build to learn) and delivery (build to earn) have different conventions. Mixing them is the failure mode.
- **`skills/prototype-hypothesis/`** — forces a one-line hypothesis before any prototype iteration. 4 questions: what does this answer, what tells us yes, what tells us no, which user. Prevents "learning theater."
- **`skills/parallel-prototypes/`** — run 2-3 variants of a UX decision in parallel instead of iterating sequentially. Cagan's "freshest observation" enabled by AI tooling.
- **`memory/tasks/regret.md`** — 2 starter entries: iterating without a hypothesis, and mixing build modes.
- **`memory/tasks/velocity.md`** — split into two tables: Discovery sessions (measured by hypotheses tested) and Delivery sessions (measured by features shipped). Don't conflate the units.

### Changed
- `CLAUDE.md` Skill Map — added separate **Build to Learn** and **Build to Earn** workflow rows
- `CLAUDE.md` @imports — added `@rules/build-mode.md` so it loads every session

### Why
The bottleneck has moved from delivery cost to discovery quality. AI made building cheap, which means knowing what to build is now the binding constraint. Discovery and delivery are different activities with different conventions, different success metrics, and different failure modes. The kit now treats them as separate first-class workflows instead of one undifferentiated "building" mode.

## v2.6 (2026-04-06)

### Changed
- `tasks/skill_scores.md` schema updated to 9 columns — `Improvement Applied` split into two unambiguous columns:
  - `Code Fixed` — how the code was corrected at the time of the session (manual / -)
  - `Skill Patched` — date when `/evolve` updated the SKILL.md, or `-` if not yet patched
  - The split eliminates a silent gate bypass: entries with `Code Fixed=manual` still have `Skill Patched=-`, so `/evolve` correctly finds them as unpatched
- `/evolve-check` now classifies skills with all Y entries patched as 🔵 PATCHED (awaiting confirmation) rather than collapsing them into 🟢 STABLE
- `/evolve-check` only counts `Skill Patched = -` rows toward URGENT/WATCH thresholds — patched rows are resolved
- `tasks/lessons.md` template pre-populated with 3 universal starter lessons so `Start Session` shows loaded lessons from day 1

### Added
- `sync.py migrate-scores` — auto-migrates existing `skill_scores.md` from 6-column or 8-column schema to 9-column in place. Supports `--dry-run` to preview before writing.
- `sync.py migrate` now includes v2.6 schema migration in its checklist

### Migration from v2.4/v2.5
If you have an existing `skill_scores.md`, run the auto-migration:

```
python sync.py migrate-scores --dry-run   # preview
python sync.py migrate-scores             # apply
```

The migration handles both old schemas:
- **8-column** (had `Improvement Applied`): splits into `Code Fixed` + `Skill Patched`
- **6-column** (old `Fired for / Correction needed`): maps columns and adds `Step=-`, `Severity=-`

Column mapping for 8-col → 9-col:
- `Improvement Applied` = `-`        → `Code Fixed=-`, `Skill Patched=-`
- `Improvement Applied` = `YYYY-MM-DD` → `Code Fixed=manual`, `Skill Patched=[date]`
- `Improvement Applied` = text description → `Code Fixed=manual`, `Skill Patched=-`

---

## v2.4 (2026-04-05)

### Added
- `sync.py`: `_check_dependencies()` — detects missing `git` with platform-specific install instructions (Windows / macOS / Linux). Called before `setup`, `setup-team`, `join`.
- `tools/memory.py`: `_snapshot_memory_state()` — records line counts of all `.md` files at session start.
- `tools/memory.py`: `cmd_memory_diff()` (`--memory-diff`) — compares current state to snapshot, prints "Memory saved: lessons.md +3, decisions.md +1" at End Session.
- `upgrade.py`: `--dry-run` flag — previews what files would be created/modified without making changes.
- `tests/test_memory.py`: 18 tests covering all 7 session-start helpers and `cmd_memory_diff`.

### Migration from v2.3
No breaking changes. To get the memory diff at End Session, add this step to your CLAUDE.md End Session section:

```
python tools/memory.py --memory-diff
```

---

## v2.3 (2026-04-04)

### Added
- `sync.py`: `cmd_diagnose()` — shows last 20 sync operations with timestamp, status, and error detail from `.claude/.sync-log.json`.
- `sync.py`: `_log_sync()` — appends every push/pull/team-push/team-pull result to the rolling log.
- `tools/memory.py`: Extracted 8 single-purpose helpers from `cmd_session_start()`: `_load_memory_context`, `_load_status_context`, `_check_interruption`, `_check_correction_queue`, `_reset_session_counter`, `_auto_team_pull`, `_check_token_budget`, `_check_kit_health`.
- `setup.py` (Lite): End Session now reports lines added per file — "Session N complete. Memory saved: notes.md +N..."
- `setup.py` (Full): End Session now calls `python tools/memory.py --memory-diff`.
- `docs/commands.md`: `/recall` failure mode table — what happens when sentence-transformers isn't installed, model download fails, or pkl is corrupted.

### Changed
- Lite mode generates 3 typed files (`notes.md`, `lessons.md`, `decisions.md`) instead of 1 generic `notes.md`.

### Migration from v2.2
If you have an existing Lite project with a single `notes.md`:
1. Split it manually: create `lessons.md` and `decisions.md` alongside `notes.md`.
2. Move lessons (things to do/avoid) into `lessons.md`.
3. Move architectural choices into `decisions.md`.
4. Update your CLAUDE.md Start Session / End Session sections to reference all 3 files.

---

## v2.2 (2026-04-03)

### Added
- `sync.py`: merged personal sync (`tools/personal_sync.py`) and team sync (`tools/team_sync.py`) into a single file.
- `sync.py`: `cmd_team_status()` — health check for team repo.
- `KIT-OVERVIEW.md`: updated to reference `sync.py`.

### Removed
- `tools/personal_sync.py` — merged into `sync.py`.
- `tools/team_sync.py` — merged into `sync.py`.

### Migration from v2.1
Replace any references to `tools/personal_sync.py` or `tools/team_sync.py` in your CLAUDE.md hooks and scripts with `sync.py`:

```
# Old
python tools/personal_sync.py push
python tools/team_sync.py team-push

# New
python sync.py push
python sync.py team-push
```

---

## v2.1 (2026-03-15)

### Added
- `tools/team_sync.py`: team memory sharing — `setup-team`, `join`, `team-push`, `team-pull`.
- Guard patterns: `guard_patterns.md` auto-merged on `team-pull`.
- Skill scores and velocity tracking in `tasks/`.

### Migration from v2.0
No file renames. Add team sync to your CLAUDE.md End Session if you want to share:

```
python tools/team_sync.py team-push
```

---

## v2.0 (2026-03-01)

### Initial release
- `setup.py`: interactive scaffolding for Lite and Full memory modes.
- `tools/memory.py`: lifecycle hooks — session start, drift detection, stop check, journal, /recall.
- `tools/personal_sync.py`: personal memory sync across machines.
- `upgrade.py`: Lite → Full upgrade path.
