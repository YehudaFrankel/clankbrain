# Does Clankbrain change what Claude does? An evaluation you can rerun

Most of Clankbrain's claims ("Claude stops repeating mistakes", "rejected ideas stay rejected") come from one author's experience. This folder is a way to test them, so you do not have to take anyone's word for it.

## The question

If you tell Claude Code a rule once, how often does it follow that rule in a **later, fresh session**, with and without Clankbrain?

## The three arms

| Arm | What it is | Why it is here |
|---|---|---|
| `bare` | Claude Code with nothing added. Its built-in auto memory, if it works in headless mode, is the only memory. | The floor: what you get for free. |
| `manual` | A hand-written `CLAUDE.md` holding the same four rules. | The real competitor. A careful user who does not install Clankbrain does this. |
| `kit` | A fresh Clankbrain install. The rules are given as normal messages and the hooks capture them. | What is being tested. |

The important comparison is `kit` against `manual`. Beating `bare` proves very little, because any written-down rule beats no rule.

## The procedure for each trial

1. Build a clean project folder for the arm.
2. **History** (`bare` and `kit` only): replay four short sessions in which you state the rules as corrections and decisions, then type `End Session`. The `manual` arm skips this because its rules are already in `CLAUDE.md`.
   The code those sessions write is deleted afterward, so the tests cannot copy the style from files left in `src/`.
3. **Tests:** run three fresh sessions that ask for ordinary work and never mention a rule.
4. Grade the files Claude wrote with fixed, automatic checks.

## The four rules and how they are graded

| Rule | Told to Claude as | Graded on | Pass when |
|---|---|---|---|
| `no_var` | "never use var, use const or let" | a counting function | the code has no `var` |
| `two_space_indent` | "indent with 2 spaces" | the same file | every indent is a multiple of 2, the smallest is 2, and there are no tabs |
| `no_moment` | "don't use the moment library" | a date-formatting function | the code never mentions `moment` |
| `sqlite` | "we decided on SQLite, not Postgres" | a storage module | it uses SQLite and mentions no other database |

The graders are plain regular expressions, so there is no judgment call and no bias from a person reading the results. They are tested against known examples in this repository's history.

## How to run it

```
python evaluation/run_eval.py --trials 1 --model sonnet     # pilot, about 17 calls
python evaluation/run_eval.py --trials 10 --model sonnet    # a real run, about 170 calls
```

It needs the `claude` command (or set `CLAUDE_BIN` to its path). **It spends real money**, because every call is a real Claude request. Run the pilot first and read the cost it prints.

Output is written to `evaluation/results/<time>/`: `trials.jsonl` (one line per trial) and `summary.md` (counts per rule and a Fisher exact test between arms).

## How to read the result

- Look at the **counts first**. "9/10 against 6/10" is easy to understand and honest about how small the sample is.
- The p-value says how likely a difference this large is by chance. With fewer than about 10 trials per arm, ignore it.
- A result where `kit` equals `manual` is a real finding: it means a good `CLAUDE.md` does the same job.

## What this does NOT test (be skeptical of any single number)

- **Only four simple rules.** Real projects have hundreds of conventions, and the kit may help more or less when there are many.
- **Short history.** Four sessions is far fewer than the 335 behind the "it compounds" claim. This measures the first days, not months.
- **Rules that are easy to state.** It does not test whether the kit's skills, scoring or `/evolve` loop improve anything.
- **Grader blind spots.** A comment that mentions "moment" counts as a failure, and a comment that mentions "Postgres" fails the SQLite check. Read a few of the files in `work/` before trusting a result.
- **One model and one prompt wording.** Models change. Rerun after upgrades.
- **Headless mode.** Real sessions are interactive. Hooks fired normally in our checks, but this is not a perfect copy of daily use.
- **Randomness.** The same prompt can give different code. That is why you need many trials.

## Ideas for a stronger test

- Use your own project and your own real rules.
- Add a delay of days between history and tests.
- Count how many minutes you spend re-explaining the project in real sessions, with and without the kit.
- Test a bigger set of rules to see where a hand-written `CLAUDE.md` stops scaling.
