# test-install.ps1 — Clankbrain install verification
# Creates a dummy project in "D:\claude projects\", runs the installer
# non-interactively, then checks every expected file and feature.
#
# Usage:
#   powershell -File "D:\claude-memory-starter\test-install.ps1"
#   powershell -File "D:\claude-memory-starter\test-install.ps1" -KeepFolder

param([switch]$KeepFolder)

$ErrorActionPreference = 'SilentlyContinue'

$date    = Get-Date -Format 'yyyyMMdd-HHmmss'
$testDir = "D:\claude projects\clankbrain-test-$date"
$kitDir  = "D:\claude-memory-starter"
$pass    = 0
$fail    = 0

# ─── Helpers ──────────────────────────────────────────────────────────────────

function Check([string]$label, [bool]$ok) {
    if ($ok) {
        Write-Host ("  [PASS] " + $label) -ForegroundColor Green
        $script:pass++
    } else {
        Write-Host ("  [FAIL] " + $label) -ForegroundColor Red
        $script:fail++
    }
}

function CheckFile([string]$label, [string]$rel) {
    Check $label (Test-Path (Join-Path $testDir $rel))
}

function CheckContains([string]$label, [string]$rel, [string]$needle) {
    $p = Join-Path $testDir $rel
    if (Test-Path $p) {
        $c = Get-Content $p -Raw -Encoding UTF8
        Check $label ($c -like "*$needle*")
    } else {
        Check $label $false
    }
}

# ─── Header ───────────────────────────────────────────────────────────────────

Write-Host ""
Write-Host "=== Clankbrain Install Test ===" -ForegroundColor Cyan
Write-Host "Kit:    $kitDir"
Write-Host "Folder: $testDir"
Write-Host ""

# ─── 1. Create test folder ────────────────────────────────────────────────────

Write-Host "--- Setup ---" -ForegroundColor Yellow
New-Item -ItemType Directory -Path $testDir -Force | Out-Null
Check "Test folder created" (Test-Path $testDir)

# ─── 2. Run installer non-interactively ───────────────────────────────────────
# Answers: Full(1), Auto-detect(1), CSS prefix empty(""), Use files(y), Skills(y)

Write-Host ""
Write-Host "--- Running installer ---" -ForegroundColor Yellow

$proc = [System.Diagnostics.Process]::new()
$proc.StartInfo.FileName = "python"
$proc.StartInfo.Arguments = "`"$kitDir\setup.py`""
$proc.StartInfo.WorkingDirectory = $testDir
$proc.StartInfo.EnvironmentVariables["PYTHONUTF8"] = "1"
$proc.StartInfo.UseShellExecute = $false
$proc.StartInfo.RedirectStandardInput = $true
$proc.StartInfo.RedirectStandardOutput = $true
$proc.StartInfo.RedirectStandardError = $true
$proc.Start() | Out-Null
$proc.StandardInput.WriteLine("1")   # Full mode
$proc.StandardInput.WriteLine("1")   # Auto-detect files
$proc.StandardInput.WriteLine("")    # CSS prefix - skip
$proc.StandardInput.WriteLine("y")   # Use detected files
$proc.StandardInput.WriteLine("y")   # Generate skills
$proc.StandardInput.Close()
$null = $proc.StandardOutput.ReadToEnd()
$proc.WaitForExit()

Check "Installer exited cleanly (exit code 0)" ($proc.ExitCode -eq 0)

# ─── 3. Core files ────────────────────────────────────────────────────────────

Write-Host ""
Write-Host "--- Core files ---" -ForegroundColor Yellow
CheckFile "CLAUDE.md"  "CLAUDE.md"
CheckFile "AGENTS.md"  "AGENTS.md"
CheckFile "STATUS.md"  "STATUS.md"
CheckFile "HELP.md"    "HELP.md"
CheckFile "update.py"  "update.py"
CheckFile ".gitignore" ".gitignore"
# upgrade.py is only copied in Lite mode — not checked here

# ─── 4. Memory files ──────────────────────────────────────────────────────────

Write-Host ""
Write-Host "--- Memory files ---" -ForegroundColor Yellow
CheckFile "memory/MEMORY.md"             ".claude\memory\MEMORY.md"
CheckFile "memory/project_status.md"     ".claude\memory\project_status.md"
CheckFile "memory/js_functions.md"       ".claude\memory\js_functions.md"
CheckFile "memory/html_css_reference.md" ".claude\memory\html_css_reference.md"
CheckFile "memory/user_preferences.md"   ".claude\memory\user_preferences.md"
CheckFile "memory/backend_reference.md"  ".claude\memory\backend_reference.md"

# ─── 5. Task files ────────────────────────────────────────────────────────────

Write-Host ""
Write-Host "--- Task files ---" -ForegroundColor Yellow
CheckFile "tasks/todo.md"              "tasks\todo.md"
CheckFile "tasks/lessons.md"           "tasks\lessons.md"
CheckFile "tasks/decisions.md"         "tasks\decisions.md"
CheckFile "tasks/errors.md"            "tasks\errors.md"
CheckFile "tasks/corrections_queue.md" "tasks\corrections_queue.md"
CheckFile "tasks/regret.md"            "tasks\regret.md"
CheckFile "tasks/skill_scores.md"      "tasks\skill_scores.md"
CheckFile "tasks/velocity.md"          "tasks\velocity.md"
CheckFile "plans/_template.md"         "plans\_template.md"
CheckFile "plans/archive/.gitkeep"     "plans\archive\.gitkeep"

# ─── 6. Tools ─────────────────────────────────────────────────────────────────

Write-Host ""
Write-Host "--- Tools ---" -ForegroundColor Yellow
CheckFile "tools/memory.py" "tools\memory.py"

# ─── 7. Skills ────────────────────────────────────────────────────────────────

Write-Host ""
Write-Host "--- Skills (copied from kit) ---" -ForegroundColor Yellow
CheckFile "skill: learn"             ".claude\skills\learn\SKILL.md"
CheckFile "skill: smart-resume"      ".claude\skills\smart-resume\SKILL.md"
CheckFile "skill: recall"            ".claude\skills\recall\SKILL.md"
CheckFile "skill: forget"            ".claude\skills\forget\SKILL.md"
CheckFile "skill: plan"              ".claude\skills\plan\SKILL.md"
CheckFile "skill: search-first"      ".claude\skills\search-first\SKILL.md"
CheckFile "skill: debug-session"     ".claude\skills\debug-session\SKILL.md"
CheckFile "skill: skill-creator"     ".claude\skills\skill-creator\SKILL.md"
CheckFile "skill: mode"              ".claude\skills\mode\SKILL.md"
CheckFile "skill: fix-bug"           ".claude\skills\fix-bug\SKILL.md"
CheckFile "skill: guard"             ".claude\skills\guard\SKILL.md"
CheckFile "skill: verification-loop" ".claude\skills\verification-loop\SKILL.md"
CheckFile "skill: tour"              ".claude\skills\tour\SKILL.md"
CheckFile "skill: kit-health"        ".claude\skills\kit-health\SKILL.md"
CheckFile "skill: evolve"            ".claude\skills\evolve\SKILL.md"
CheckFile "skill: evolve-check"      ".claude\skills\evolve-check\SKILL.md"

Write-Host ""
Write-Host "--- Skills (generated templates) ---" -ForegroundColor Yellow
CheckFile "skill: security-check"    ".claude\skills\security-check\SKILL.md"
CheckFile "skill: new-feature"       ".claude\skills\new-feature\SKILL.md"
CheckFile "skill: environment-check" ".claude\skills\environment-check\SKILL.md"
CheckFile "skill: run-verification"  ".claude\skills\run-verification\SKILL.md"
CheckFile "skill: refactor"          ".claude\skills\refactor\SKILL.md"

# ─── 8. Content sanity checks ─────────────────────────────────────────────────

Write-Host ""
Write-Host "--- Content checks ---" -ForegroundColor Yellow
CheckContains "CLAUDE.md has Start Session"    "CLAUDE.md"                "Start Session"
CheckContains "CLAUDE.md has End Session"      "CLAUDE.md"                "End Session"
CheckContains "CLAUDE.md has Check Drift"      "CLAUDE.md"                "Check Drift"
CheckContains "STATUS.md seeded"               "STATUS.md"                "Current Session"
CheckContains "MEMORY.md has currentDate"      ".claude\memory\MEMORY.md" "currentDate"
CheckContains "MEMORY.md has project_status"   ".claude\memory\MEMORY.md" "project_status"
CheckContains ".gitignore has HANDOFF.md"      ".gitignore"               "HANDOFF.md"
CheckContains "user_preferences has type:user" ".claude\memory\user_preferences.md" "type: user"

# ─── 9. settings.json ─────────────────────────────────────────────────────────

Write-Host ""
Write-Host "--- settings.json ---" -ForegroundColor Yellow
$settingsPath = Join-Path $testDir ".claude\settings.json"
if (Test-Path $settingsPath) {
    $settingsRaw = Get-Content $settingsPath -Raw -Encoding UTF8
    $parsed = $false
    try {
        $s = $settingsRaw | ConvertFrom-Json
        $parsed = $true
    } catch { }
    Check "settings.json valid JSON"        $parsed
    if ($parsed) {
        Check "settings.json has hooks"         ($null -ne $s.hooks)
        Check "hook: UserPromptSubmit wired"    ($null -ne $s.hooks.UserPromptSubmit)
        Check "hook: PostToolUse wired"         ($null -ne $s.hooks.PostToolUse)
        Check "hook: Stop wired"                ($null -ne $s.hooks.Stop)
        Check "hook references memory.py"       ($settingsRaw -like "*memory.py*")
    } else {
        Check "settings.json has hooks"         $false
        Check "hook: UserPromptSubmit wired"    $false
        Check "hook: PostToolUse wired"         $false
        Check "hook: Stop wired"                $false
        Check "hook references memory.py"       $false
    }
} else {
    Check "settings.json exists"    $false
    Check "settings.json valid JSON"    $false
    Check "settings.json has hooks"     $false
    Check "hook: UserPromptSubmit wired"    $false
    Check "hook: PostToolUse wired"         $false
    Check "hook: Stop wired"                $false
    Check "hook references memory.py"       $false
}

# ─── 10. memory.py syntax + functional ────────────────────────────────────────

Write-Host ""
Write-Host "--- Functional checks ---" -ForegroundColor Yellow

$memPy = Join-Path $testDir "tools\memory.py"
if (Test-Path $memPy) {
    python -m py_compile $memPy 2>&1 | Out-Null
    Check "memory.py syntax valid" ($LASTEXITCODE -eq 0)
} else {
    Check "memory.py syntax valid" $false
}

# kit-health command — checks that all components are wired
Push-Location $testDir
$healthOut = python "tools\memory.py" "--kit-health" 2>&1
$healthCode = $LASTEXITCODE
Check "memory.py --kit-health runs" ($healthCode -eq 0)
if ($healthCode -ne 0) {
    Write-Host "    Output: $healthOut" -ForegroundColor DarkGray
}

# check-drift command — should run cleanly on empty project
$driftOut = python "tools\memory.py" "--check-drift" 2>&1
$driftCode = $LASTEXITCODE
Check "memory.py --check-drift runs" ($driftCode -eq 0)
if ($driftCode -ne 0) {
    Write-Host "    Output: $driftOut" -ForegroundColor DarkGray
}
Pop-Location

# ─── Summary ──────────────────────────────────────────────────────────────────

$total = $pass + $fail
Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
if ($fail -eq 0) {
    Write-Host ("  All $total checks passed") -ForegroundColor Green
} else {
    Write-Host ("  $pass / $total passed  ($fail failed)") -ForegroundColor Yellow
    Write-Host "  Review [FAIL] lines above" -ForegroundColor Red
}
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# ─── Cleanup ──────────────────────────────────────────────────────────────────

if (-not $KeepFolder) {
    $del = Read-Host "Delete test folder? [Y/n]"
    if ($del -eq '' -or $del.ToLower() -eq 'y') {
        Remove-Item -Path $testDir -Recurse -Force
        Write-Host "Deleted." -ForegroundColor DarkGray
    } else {
        Write-Host "Kept at: $testDir"
    }
}
