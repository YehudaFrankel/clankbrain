# Error Log

<!-- Known bugs + root causes. Never debug the same thing twice. -->

| Date | Error | Root cause | Fix applied |
|------|-------|-----------|-------------|
| 2026-01-08 | `Cannot read properties of undefined (reading 'map')` on dashboard load | API returns `null` when user has no items, not `[]`; `.map()` on null throws | Added `?? []` fallback in the fetcher: `return data.items ?? []` |
| 2026-01-19 | CORS error on `/api/auth/refresh` in production only | Prod domain not in the CORS allowlist in `server/middleware/cors.ts` | Added production domain; added test that checks allowlist includes all env URLs |
| 2026-02-03 | Postgres `idle timeout` error after 1h of inactivity | Connection pool `idleTimeoutMillis` was lower than Postgres's `tcp_keepalives_idle` | Set `idleTimeoutMillis: 30000`, added `keepAlive: true` to pool config |
| 2026-02-22 | React Query refetch loop — network tab showed 10+ identical requests per second | `queryKey` included an object literal `{}` — new reference on every render caused infinite refetch | Moved queryKey values to stable variables outside the component |
| 2026-03-10 | Drizzle migration failed silently — `db.execute()` returned success but column wasn't added | Was running against the wrong DATABASE_URL (dev DB in prod shell) | Added `console.log(process.env.DATABASE_URL)` at migration start; added env assertion |
