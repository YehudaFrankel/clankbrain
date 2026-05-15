# Error Log

| Date | Error | Root cause | Fix applied |
|------|-------|-----------|-------------|
| 2026-01-08 | `concurrent map writes` panic under load | Map shared across goroutines without a mutex — race detector caught it | Added `sync.RWMutex`; run `go test -race` in CI on every PR |
| 2026-01-22 | `context deadline exceeded` on DB query that used to be fast | Missing index — query was doing a full scan on a 2M row table | Added index; now run `EXPLAIN ANALYZE` on any query that touches tables over 100K rows |
| 2026-02-07 | `too many open files` in production | HTTP client created per-request — each created a new connection, exhausted file descriptors | Moved to a single shared `http.Client` with connection pooling; set `MaxIdleConnsPerHost` |
| 2026-02-22 | Response body read after handler returned — garbage data | `r.Body` read in a goroutine launched from the handler — body closed when handler returned | Read body synchronously in the handler; pass the data (not the reader) to goroutines |
| 2026-03-10 | `invalid memory address or nil pointer dereference` on startup | Optional config value accessed without nil check — missing env var caused nil pointer | Added `mustGetEnv()` helper that panics with a clear message on missing required env vars |
