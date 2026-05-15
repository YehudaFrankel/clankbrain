# Architectural Decisions

| Date | Decision | Why | Alternatives rejected |
|------|----------|-----|----------------------|
| 2026-01-05 | `pgx` directly, no ORM | Full SQL control, no magic, pgx is faster than database/sql for Postgres. Query complexity never justifies an ORM on this project. | GORM (magic, slow, hides query cost), sqlx (fine but pgx is strictly better for Postgres), sqlc (good but adds codegen step) |
| 2026-01-12 | Errors wrapped with `fmt.Errorf("context: %w", err)` everywhere | `errors.Is()` and `errors.As()` work correctly; stack traces via `%w`; consistent pattern across codebase | `errors.New()` (loses original error), third-party error packages (stdlib is enough), bare string errors (untestable) |
| 2026-01-22 | `chi` router, not `gin` or `echo` | Stdlib-compatible `http.Handler`; zero magic; easy to test with `httptest`; no framework lock-in | Gin (fast but non-stdlib handlers), Echo (similar issue), stdlib only (no group routing, middleware chain is manual) |
| 2026-02-10 | Config via environment variables only, no config files | 12-factor compliant; works identically in local, CI, and prod; secrets never in files | YAML config files (checked into git accidentally twice), `.env` files (same risk), Viper (overkill for this size) |
| 2026-03-02 | Structured logging with `slog` (stdlib) | Zero dependencies; JSON output in prod, human-readable in dev; consistent fields; no `logrus`/`zap` opinion needed | `logrus` (not stdlib, slower), `zap` (great but dependency), `log.Printf` (no structure, can't query in prod) |
