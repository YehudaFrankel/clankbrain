# Rejected Approaches

<!-- These were tried and discarded. Claude reads this before proposing solutions. -->

| Approach | Why rejected |
|----------|-------------|
| Using `useReducer` for form state | Overkill for this codebase — React Hook Form handles validation, dirty state, and submission in 10 lines vs 80. Only revisit for forms with >10 interdependent fields. |
| Storing JWT in localStorage | XSS risk — any injected script can steal the token. Switched to httpOnly cookies. Never go back. |
| Server-side rendering with Next.js App Router | Cache invalidation was unpredictable; streaming responses broke our error boundary setup. Reverted to pages/ dir. Don't propose App Router again. |
| GraphQL for the API layer | Added 3 layers of abstraction for a CRUD app. REST with typed fetcher is 80% simpler and covers every use case we have. |
| UUID v4 as primary keys across all tables | Caused index fragmentation on insert-heavy tables. Switched to ULID (sortable, similar uniqueness). Never use random UUIDs as PKs again. |
