# Lessons Learned

<!-- Loaded every session start. 50 sessions on a Go + Postgres project. -->

| Date | What went wrong | Rule to prevent it |
|------|----------------|-------------------|
| 2026-01-05 | Goroutine leak — launched `go func()` without a way to cancel it | Every goroutine needs a `context.Context` cancel path; use `context.WithCancel` and always `defer cancel()` |
| 2026-01-08 | `defer rows.Close()` missing — connection pool exhausted under load | Always `defer rows.Close()` immediately after `db.Query()`; never skip it even for "small" queries |
| 2026-01-12 | Checked error after using the value — got wrong result silently | Always `if err != nil { return }` before using the value; never use a value and check the error after |
| 2026-01-15 | Copied a `sync.Mutex` by value — lock state not shared | Mutexes must be passed by pointer or embedded in a struct that's always used by pointer |
| 2026-01-19 | `http.DefaultClient` used for outbound calls — no timeout, hung forever | Always construct a custom `http.Client` with `Timeout` set; never use `http.DefaultClient` in production |
| 2026-01-22 | `map` read/write from multiple goroutines without a mutex — data race | Maps are not goroutine-safe; use `sync.RWMutex` or `sync.Map` for concurrent access |
| 2026-01-26 | Ignored error from `json.Unmarshal` — silently used zero-value struct | Every error return must be checked; `json.Unmarshal` errors are especially easy to miss |
| 2026-01-30 | `os.Exit()` called inside a goroutine — deferred functions didn't run, DB connection left open | Only call `os.Exit()` from `main()`; use `log.Fatal()` at most, and handle shutdown with signals |
| 2026-02-03 | `interface{}` (any) used as a function parameter — type assertion panic at runtime | Use concrete types or typed interfaces; `any` as a param is a code smell that hides bugs |
| 2026-02-07 | DB transaction not rolled back on error — rows locked until timeout | Pattern: `tx, _ := db.Begin(); defer tx.Rollback(); ...; tx.Commit()` — defer Rollback is a no-op after Commit |
| 2026-02-10 | String conversion inside hot loop — `[]byte(s)` allocated on every iteration | Pre-allocate outside the loop or use `strings.Builder`; profile before optimizing but know the pattern |
| 2026-02-14 | `init()` function had a side effect that failed silently — program ran with wrong config | Avoid `init()` for anything that can fail; use explicit initialization in `main()` with error returns |
| 2026-02-18 | Forgot to call `WaitGroup.Done()` in error path — `wg.Wait()` hung forever | Always `defer wg.Done()` immediately after `wg.Add(1)`; never put it only in the happy path |
| 2026-02-22 | Named return values used with a bare `return` — shadowed variable caused wrong value | Named returns are fine for documentation but always use explicit `return value` to avoid shadowing |
| 2026-02-26 | Struct tags missing on exported field — JSON key was capitalized, client broke | Every exported struct field that's serialized needs a `json:"snake_case"` tag; enforced by linter |
| 2026-03-02 | `time.Sleep` in a loop polling for a condition — leaked goroutine when context cancelled | Use `select { case <-ctx.Done(): return; case <-time.After(interval): }` pattern instead |
| 2026-03-06 | `panic` used for a recoverable error in a library function | `panic` is for unrecoverable programmer errors only; return `(T, error)` for anything callers should handle |
| 2026-03-10 | Slice append returned new slice but caller used old variable — lost updates | `append` may return a new slice; always assign back: `s = append(s, item)` |
| 2026-03-14 | `iota` enum values shifted after inserting a new constant in the middle | Never insert `iota` constants in the middle of an existing sequence; always append at the end |
| 2026-03-18 | `sql.ErrNoRows` not handled separately — treated as a server error, returned 500 | Check for `errors.Is(err, sql.ErrNoRows)` before the generic error handler; return 404 not 500 |
