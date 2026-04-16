# Acme Todo App — Claude Code Context

## What This Project Is
A task management app for small teams. Users create projects, add tasks, assign to teammates, track progress. Built as a side project, growing into a real product.

## Tech Stack
- **Backend:** Node.js + Express, TypeScript
- **Frontend:** React 18 + Tailwind CSS
- **Database:** PostgreSQL (Prisma ORM)
- **Hosting:** Vercel (frontend) + Railway (backend)
- **Auth:** Clerk

## Memory & GitHub
Memory repo: `https://github.com/yourname/acme-memory` (private)
`[MEM]` = path to your memory directory (set by clankbrain)

## Commands

### `Start Session`
1. Pull memory from GitHub
2. Read `[MEM]/STATUS.md`
3. Report: "Ready. Last change: [summary]. What are we working on?"

### `End Session`
1. Run `/learn` — extract patterns from this session
2. Run `/evolve-check` — check skill health
3. Update `[MEM]/STATUS.md`
4. Push memory to GitHub
5. Report: "Session complete. Memory pushed."

## Key Files
| File | Purpose |
|------|---------|
| `src/server/routes/tasks.ts` | Task CRUD API endpoints |
| `src/server/routes/projects.ts` | Project management endpoints |
| `src/components/TaskBoard.tsx` | Kanban board UI |
| `src/components/TaskCard.tsx` | Individual task card |
| `prisma/schema.prisma` | Database schema |
| `.env` | Environment variables (NEVER commit) |

## Rules
- **Plan before edit** — show what you're changing and why before touching code
- **Never modify `.env`** — tell the user what to change manually
- **All user input must be sanitized** — use Prisma parameterized queries, never raw SQL
- **TypeScript strict mode** — no `any` types, no `@ts-ignore`
- **Tests required** — every new endpoint gets a test in `__tests__/`

## Settled Decisions
- **Prisma over raw SQL** — type safety + migrations. Don't suggest switching to Knex/Drizzle.
- **Clerk for auth** — handles Google OAuth, magic links, session management. Don't build custom auth.
- **Tailwind over CSS modules** — team preference. Don't suggest styled-components.
- **REST over GraphQL** — simpler for our scale. Revisit at 50+ endpoints.

## Rejected Approaches
| Approach | Why Rejected |
|---|---|
| Socket.io for real-time | Added complexity, SSE is enough for our use case |
| Redux for state | Overkill — React Query + Zustand handles everything |
| Monorepo with Turborepo | Two devs, one repo is fine. Revisit with 5+ devs |

## Skill Map
| Workflow | Skills in Order |
|----------|----------------|
| **New Feature** | `/search-first` → `/plan` → *(code)* → `/code-reviewer` → `/learn` |
| **Bug Fix** | `/debug-session` → *(fix)* → `/learn` |
| **End of Session** | `/learn` → `/evolve-check` → update STATUS.md |
