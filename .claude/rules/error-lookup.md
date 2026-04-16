# Error Lookup

After fixing ANY bug, add a row here so the same bug never costs time again.

| Symptom | Root Cause | Fix | Date |
|---------|-----------|-----|------|
| (example) API returns 500 on save | Missing required field in INSERT | Added EntityID column | 2026-01-01 |

## Rules
- Add the row IMMEDIATELY after fixing — don't wait for end of session
- Symptom = what the user saw (error message, wrong behavior)
- Root cause = WHY it happened (not just "it was broken")
- Fix = WHAT you changed (file + line if possible)
- The debug-session skill reads this before investigating new bugs
