# Architectural Decisions

<!-- Settled choices — don't re-propose these. Loaded every session. -->

| Date | Decision | Why | Alternatives rejected |
|------|----------|-----|----------------------|
| 2026-01-05 | React Query for server state, Zustand for client state | React Query handles caching/invalidation automatically; Zustand for UI-only state that doesn't need to sync with the server | Redux (too much boilerplate), Context (re-renders whole tree on any change) |
| 2026-01-12 | Postgres with Drizzle ORM | Type-safe queries without the overhead of Prisma's abstraction; raw SQL escape hatch when needed | Prisma (slower migrations, magic codegen), raw pg (no type safety), MongoDB (relational data doesn't fit document model) |
| 2026-01-22 | API routes return camelCase, DB stores snake_case | Postgres convention is snake_case; JS convention is camelCase; transform at the API boundary | All camelCase everywhere (breaks psql tooling), all snake_case (inconsistent with React conventions) |
| 2026-02-10 | Feature flags via env vars, not DB | Zero latency, no DB call on every render, easier to audit | DB feature flags (adds a query to every page load), third-party flag service (another dependency, cost) |
| 2026-03-02 | Optimistic UI updates via React Query's `onMutate` | Instant feedback, automatic rollback on error | Wait for server confirmation (laggy feel), manual state management (duplicates React Query logic) |
