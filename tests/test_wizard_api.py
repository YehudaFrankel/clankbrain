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


def test_missing_fields_are_rejected():
    out = _call({'projectName': '', 'language': 'python', 'projectType': 'cli'})
    assert out['status'] == 400


def test_get_is_rejected():
    out = _call(_body('python'), method='GET')
    assert out['status'] == 405
