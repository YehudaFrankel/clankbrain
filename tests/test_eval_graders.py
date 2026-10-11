"""
tests/test_eval_graders.py - Tests for the automatic graders and statistics in evaluation/run_eval.py.

Run:
  pip install pytest
  pytest tests/test_eval_graders.py -v
"""

import importlib.util
from pathlib import Path

import pytest

KIT_ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location('run_eval', KIT_ROOT / 'evaluation' / 'run_eval.py')
run_eval = importlib.util.module_from_spec(spec)
spec.loader.exec_module(run_eval)

GOOD = "const a = 1;\nfunction f(x) {\n  if (x) {\n    return 1;\n  }\n}\n"
FOUR_SPACES = "function f(x) {\n    return 1;\n}\n"
TABS = "function f(x) {\n\treturn 1;\n}\n"
WITH_VAR = "var a = 1;\nfunction f() {\n  return 1;\n}\n"


@pytest.mark.parametrize('code, expected', [
    (GOOD, {'no_var': True, 'two_space_indent': True}),
    (FOUR_SPACES, {'no_var': True, 'two_space_indent': False}),
    (TABS, {'no_var': True, 'two_space_indent': False}),
    (WITH_VAR, {'no_var': False, 'two_space_indent': True}),
])
def test_counter_grading(code, expected):
    assert run_eval.grade('counter', code) == expected


@pytest.mark.parametrize('code, expected', [
    ("const moment = require('moment');", False),
    ("new Date().toISOString().slice(0, 10)", True),
])
def test_report_grading(code, expected):
    assert run_eval.grade('report', code) == {'no_moment': expected}


@pytest.mark.parametrize('code, expected', [
    ("const Database = require('better-sqlite3');", True),
    ("const { Pool } = require('pg');", False),
    ("sqlite3 and postgres together", False),
])
def test_store_grading(code, expected):
    assert run_eval.grade('store', code) == {'sqlite': expected}


def test_empty_output_is_not_graded():
    assert run_eval.grade('store', '   ') == {}


def test_fisher_exact_known_values():
    assert run_eval.fisher_two_sided(10, 0, 0, 10) < 0.001
    assert run_eval.fisher_two_sided(5, 5, 5, 5) == pytest.approx(1.0)
    assert run_eval.fisher_two_sided(8, 2, 5, 5) == pytest.approx(0.350, abs=0.01)
