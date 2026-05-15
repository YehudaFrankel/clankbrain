# Rejected Approaches

| Approach | Why rejected |
|----------|-------------|
| Global `var db *sql.DB` package variable | Made tests impossible to isolate — all tests shared one connection. Switched to dependency injection: DB passed as a field on every handler struct. Never use package-level DB globals. |
| `recover()` in every goroutine to catch panics | False safety — masked real bugs. A panic means programmer error; recovering from it hid two separate nil dereference bugs for weeks. Let panics propagate to the top-level middleware that logs and returns 500. |
| Returning errors as HTTP response bodies directly | `err.Error()` exposed internal table names, file paths, and SQL errors to clients. Now: log the full error internally, return a generic message to the client, include a request ID for correlation. |
| Interface for everything (over-abstraction) | Defined interfaces for types that had exactly one implementation. Added no testability benefit and made the call graph harder to follow. Now: define an interface only when you have two implementations or need to mock for tests. |
| `sync.Map` everywhere for "thread safety" | `sync.Map` is slower than a plain `map` with a `sync.RWMutex` for read-heavy workloads. Replaced with explicit mutex after profiling showed it was the bottleneck on the cache layer. |
