# Lessons Learned

<!-- Loaded every session start. These are 50 sessions of accumulated knowledge for a TypeScript/React + Node/Postgres project. -->
<!-- Replace with your own lessons via /learn at End Session. -->

| Date | What went wrong | Rule to prevent it |
|------|----------------|-------------------|
| 2026-01-05 | Forgot to await db.transaction() — partial writes on error | Always await db.transaction() and wrap in try/catch; rollback on any throw |
| 2026-01-08 | Used `useEffect` with stale closure — state read was always the initial value | When reading state inside useEffect, add it to the dependency array or use a ref |
| 2026-01-12 | Deployed with `NODE_ENV=development` — logs leaked to prod | Add NODE_ENV check to deployment script; fail build if not production |
| 2026-01-15 | Added index to a column that already had one — silent no-op but wasted 20 min | Check `\d tablename` in psql before adding indexes; verify with pg_indexes |
| 2026-01-19 | API route returned 200 on auth failure — client couldn't distinguish | Auth failures always return 401, not 200 with an error body |
| 2026-01-22 | React key used array index — list reorder caused wrong item to re-render | Always use stable unique IDs as React keys, never array index |
| 2026-01-26 | Date stored as UTC, displayed as local — 1-day offset for some timezones | Store all dates as UTC; convert to local timezone in the display layer only |
| 2026-01-30 | Forgot to invalidate React Query cache after mutation — UI showed stale data | Every mutation must call queryClient.invalidateQueries with the relevant key |
| 2026-02-03 | Used `parseInt` on a decimal string — silently truncated the fractional part | For money/decimal fields use `parseFloat` or keep as string until display |
| 2026-02-07 | Schema migration ran in prod before staging — irreversible ALTER TABLE | Migrations run staging first, always. Deploy script enforces order. |
| 2026-02-10 | Forgot `?` in optional chaining — TypeError on null user.profile | When accessing nested fields from an API response, always use optional chaining |
| 2026-02-14 | Sent raw error message to client — exposed internal table name | Never forward raw Error.message to API responses; use generic "Something went wrong" |
| 2026-02-18 | CSS media query breakpoint off by 1px — layout broke at exactly 768px | Use `max-width: 767px` for mobile, `min-width: 768px` for desktop — never the same value |
| 2026-02-22 | Added feature flag without a kill switch — couldn't turn it off without deploy | Every feature flag needs both an enable and disable path in the config |
| 2026-02-26 | Forgot to add `loading` state — button was clickable during API call, submitted twice | Every API-triggered button needs `disabled={isLoading}` while the request is in flight |
| 2026-03-02 | Used `==` instead of `===` — null and undefined both matched | TypeScript strict mode catches this; never use `==` in this codebase |
| 2026-03-06 | Destructured default export — broke when module changed to named export | Always check import style matches the export before shipping |
| 2026-03-10 | Forgot to handle empty array from API — `.map()` worked but UI showed nothing | Always render an empty state component when the data array has length 0 |
| 2026-03-14 | Added `console.log` in a loop — logged 500 lines per page load | Remove all console.logs before merging; use the logger utility for intentional output |
| 2026-03-18 | Ran migration without a transaction — half-applied schema on timeout | All migrations must be wrapped in BEGIN/COMMIT; test rollback path before running |
