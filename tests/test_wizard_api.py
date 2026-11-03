"""
tests/test_wizard_api.py - Tests for the website wizard backend (api/generate.js).

Covers: every language generates without error, every generated skill has valid
name/description frontmatter, missing fields are rejected.
Needs Node.js; skipped when node is not installed.

Run:
  pip install pytest
  pytest tests/test_wizard_api.py -v
"""

import json
import re
import shutil
import subprocess
from pathlib import Path

import pytest

KIT_ROOT = Path(__file__).resolve().parent.parent
NODE = shutil.which('node')

pytestmark = pytest.mark.skipif(NODE is None, reason='node is not installed')

LANGUAGES = ['javascript', 'python', 'java', 'go', 'rust', 'csharp', 'ruby', 'php', 'swift', 'kotlin', 'other']

RUNNER = """
var generate = require(%s);
var body = JSON.parse(process.argv[1]);
var res = {
  status: function (c) { this.code = c; return this; },
  json: function (o) { process.stdout.write(JSON.stringify({ status: this.code || 200, body: o })); }
};
generate({ method: process.argv[2] || 'POST', body: body }, res);
"""


def _call(body, method='POST'):
    script = RUNNER % json.dumps(str(KIT_ROOT / 'api' / 'generate.js'))
    result = subprocess.run(
        [NODE, '-e', script, json.dumps(body), method],
        capture_output=True, text=True, encoding='utf-8', timeout=60,
    )
    assert result.returncode == 0, result.stderr[-400:]
    return json.loads(result.stdout)


def _body(language):
    return {
        'projectName': 'demo', 'language': language, 'projectType': 'web-app', 'teamSize': 'solo',
        'conventions': ['plan-before-edit', 'naming-conventions', 'code-review', 'security',
                        'protected-files', 'memory-system', 'scan-codebase'],
        'additionalContext': 'it\'s "quoted" <b>html</b>',
    }


@pytest.mark.parametrize('language', LANGUAGES)
def test_every_language_generates_valid_skills(language):
    out = _call(_body(language))
    assert out['status'] == 200
    files = out['body']['files']
    assert 'CLAUDE.md' in files
    skills = {n: t for n, t in files.items() if re.match(r'^skills/[^/]+/SKILL\.md$', n)}
    assert skills, 'no skills generated'
    for name, text in skills.items():
        match = re.match(r'---\n(.*?)\n---\n', text, re.S)
        assert match, name + ' has no frontmatter'
        folder = name.split('/')[1]
        assert re.search(r'^name: ' + re.escape(folder) + r'$', match.group(1), re.M), name + ' name != folder'
        assert re.search(r'^description: .+', match.group(1), re.M), name + ' has no description'


KIT_FILES = [
    'tools/memory.py', 'agents/plan.md', 'memory/error-lookup.md', 'INSTALL.md',
    'rules/regret-top.md', 'rules/token-rules.md', 'rules/error-lookup.md', 'rules/guard-patterns.md',
] + ['skills/' + n + '/SKILL.md' for n in
     ['kit-health', 'tour', 'search-memory', 'recall', 'forget', 'smart-resume', 'guard', 'verification-loop', 'search-first',
      'skill-creator', 'product-risk', 'prototype-hypothesis', 'parallel-prototypes']]


@pytest.mark.parametrize('language', LANGUAGES)
def test_wizard_ships_hooks_and_the_files_they_need(language):
    files = _call(_body(language))['body']['files']
    settings = json.loads(files['settings.json'])
    assert 'SessionStart' in settings['hooks']
    assert 'python tools/memory.py' in files['settings.json']
    for name in KIT_FILES:
        assert name in files and files[name].strip(), name + ' missing'
    assert 'sync.py' not in files, 'sync.py must only ship when a GitHub username is given'
    assert 'STATUS.md' in files and 'memory/STATUS.md' not in files, 'STATUS.md belongs at the project root'
    assert '## Turn Repeat Routines Into Skills' in files['CLAUDE.md']


def test_product_skills_are_opt_in_and_have_no_project_leftovers():
    files = _call(_body('python'))['body']['files']
    for name in ['product-risk', 'prototype-hypothesis', 'parallel-prototypes']:
        text = files['skills/' + name + '/SKILL.md']
        assert 'KeepAlive' not in text, name + ' mentions the author project'
        assert 'build-mode.md' not in text and 'combine-plans.md' not in text, name + ' points at a missing file'
        description = re.search(r'^description: (.+)$', text, re.M).group(1)
        assert 'Triggers only when asked' in description, name + ' can start on everyday phrases'


def test_python3_choice_rewrites_every_hook_command():
    body = _body('python')
    body['pythonCommand'] = 'python3'
    text = _call(body)['body']['files']['settings.json']
    assert 'python3 tools/memory.py' in text
    assert re.search(r'"python tools/', text) is None


def test_github_username_adds_sync_script_and_instructions():
    body = _body('python')
    body['githubUser'] = 'someone'
    files = _call(body)['body']['files']
    assert 'sync.py' in files
    assert 'python sync.py setup https://github.com/someone/demo-memory.git' in files['SYNC.md']


def test_missing_fields_are_rejected():
    out = _call({'projectName': '', 'language': 'python', 'projectType': 'cli'})
    assert out['status'] == 400


def test_get_is_rejected():
    out = _call(_body('python'), method='GET')
    assert out['status'] == 405


def test_download_builds_a_valid_zip_without_dependencies(tmp_path):
    """api/download.js writes the zip itself (no jszip); it must open cleanly and keep file contents."""
    import zipfile
    out = tmp_path / 'out.zip'
    script = r"""
var fs = require('fs');
var download = require(%s);
var files = { 'CLAUDE.md': '# caf\u00e9 \u2014 hello', 'memory/lessons.md': 'one\ntwo', 'memory.ps1': 'root file', 'tools/memory.py': 'py', 'sync.py': 'sync', 'STATUS.md': 'status' };
var res = {
  status: function (c) { this.code = c; return this; },
  json: function (o) { console.error(JSON.stringify(o)); },
  setHeader: function () {},
  send: function (b) { fs.writeFileSync(%s, b); }
};
download({ method: 'POST', body: { files: JSON.stringify(files) } }, res);
""" % (json.dumps(str(KIT_ROOT / 'api' / 'download.js')), json.dumps(str(out)))
    result = subprocess.run([NODE, '-e', script], capture_output=True, text=True, encoding='utf-8', timeout=60)
    assert result.returncode == 0, result.stderr[-400:]
    with zipfile.ZipFile(out) as z:
        assert z.testzip() is None
        assert sorted(z.namelist()) == ['.claude/CLAUDE.md', '.claude/memory/lessons.md', 'STATUS.md', 'memory.ps1', 'sync.py', 'tools/memory.py']
        assert z.read('.claude/CLAUDE.md').decode('utf-8') == '# caf\u00e9 \u2014 hello'
        assert z.read('.claude/memory/lessons.md').decode('utf-8') == 'one\ntwo'
