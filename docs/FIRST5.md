# Your First 5 Sessions

The system compounds with use — but only after you've given it something to compound. These 5 sessions build the foundation. After session 5, the system starts pulling its own weight.

Don't skip sessions. Don't do 5 in one day. One session = one real work block.

---

## Session 1 — Prove it works

**Goal:** Confirm the kit installed correctly and understand the two commands.

1. Type `kit-health` — should show all green checks
2. Type `tour` — 5-minute walkthrough, do it interactively
3. Do real work for 20-30 minutes (any task in your project)
4. Type `End Session`

**What to notice:** The End Session output. It extracted at least one lesson. That lesson will load next session automatically — without you doing anything.

**Don't worry about:** Doing everything perfectly. The system learns from imperfect sessions too.

---

## Session 2 — Make your first plan

**Goal:** Use `/plan` before touching code. See what a structured plan feels like.

1. Type `Start Session` — notice it loads yesterday's lesson
2. Pick one task you were going to do anyway
3. Before writing any code, type `/plan [task name]`
4. Read the plan. Notice the Challenge section — it argues against your own approach
5. Say "yes" and let it execute
6. Type `End Session`

**What to notice:** The plan caught something you hadn't considered, OR confirmed your approach was right. Either outcome is valuable.

**The habit being built:** Plan before edit. This is the highest-leverage habit in the kit.

---

## Session 3 — Let the regret guard fire

**Goal:** See the system block a bad approach before it happens.

1. Type `Start Session`
2. Do real work — fix a bug or build a feature
3. At some point, propose an approach you've tried before that didn't work
4. Watch Claude check `regret.md` and flag it silently
5. If it doesn't fire naturally: add one rejected approach to `tasks/regret.md` manually ("tried X, broke Y because Z")
6. Type `End Session`

**What to notice:** The regret guard is permanent. That approach is blocked in every future session, forever.

**The habit being built:** When something fails, log it immediately. Future you will thank you.

---

## Session 4 — Check your skills

**Goal:** See the skill scoring system in action.

1. Type `Start Session`
2. Do real work — use at least 2 different skills (`/fix-bug`, `/code-review`, `/plan`, etc.)
3. Type `End Session`
4. When `/learn` asks about skill scores, answer honestly — did it work or need correction?

**What to notice:** `tasks/skill_scores.md` now has entries. `/evolve-check` reads these. Skills that fail twice get patched by `/evolve`.

**The habit being built:** Honest skill scoring. Vague feedback produces vague improvements.

---

## Session 5 — See the compounding

**Goal:** Verify the system is working.

1. Type `Start Session` — notice it loads multiple lessons now
2. Do real work
3. Before `End Session`, type `progress report`
4. Read the numbers — lessons, rejected approaches, known errors, skill accuracy
5. Type `End Session`

**What to notice:** The system has accumulated real signal. Rejected approaches are blocked. Lessons load automatically. Skills have scores.

**What happens next:** The compounding continues on its own as long as you run `Start Session` and `End Session`. You've done the hard part.

---

## After session 5

The system is running. From here:

- **Every session:** `Start Session` → work → `End Session` (or `Fast Close` when short on time)
- **Every 5 sessions:** `evolve-check` → patch any 🔴/🟡 skills
- **Any time:** `progress report` to see the numbers

The gap between session 5 and session 50 is just consistency. The system does the rest.

→ [Full command reference](commands.md)
→ [What to do when something breaks](faq.md)
