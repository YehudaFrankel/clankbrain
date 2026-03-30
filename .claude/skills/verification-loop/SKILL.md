# Skill: verification-loop

**Trigger:** "verify" or "run verification loop" or "check this works" or after any code change

**Auto-triggered by:** `debug-session` after Step 5 (fix applied). Fires automatically — user does not need to ask.

**Description:** Continuous self-evaluation after code changes. Combines compile/build verification with functional smoke tests and a code quality self-check. Catches problems before the user has to report them.

**Allowed Tools:** Bash, Read, Glob

---

## Steps

### 1. Build/Compile Check
- Run your project's build command
- Verify exit code 0 / no errors
- If build fails: fix before proceeding

### 2. Smoke Test
- Identify which endpoint(s) or function(s) were changed
- Call/invoke each with minimal valid inputs
- Verify expected output — not just "no error"
- Check for runtime errors in logs

### 3. Frontend Check (if applicable)
- Verify the changed UI element renders correctly
- Check that no JS errors would appear in console
- Verify no `undefined` values in rendered output

### 4. Self-Evaluation Checklist
- [ ] Does the change do exactly what was asked — no more, no less?
- [ ] Are edge cases handled? (empty values, null, missing params)
- [ ] Does it follow the project's conventions?
- [ ] Are memory files updated? (function indexes, reference docs)
- [ ] Any new code that introduces the same pattern we just fixed elsewhere?

### 5. Report
- ✅ "All checks passed — [summary of what was verified]"
- ❌ "[Issue found] — [description and suggested fix]"

---

## Notes

- Run this skill after every substantive code change, before reporting done
- "It compiled" is not the same as "it works" — always smoke test
- Update memory/reference docs as part of verification, not as an afterthought
- If verification reveals a new issue, fix it before marking the task complete
