# Architectural Decisions

| Date | Decision | Why | Alternatives rejected |
|------|----------|-----|----------------------|
| 2026-01-05 | Sidekiq for background jobs, not ActiveJob with the default adapter | Sidekiq's Redis-backed queue is reliable, has a web UI, and retry logic is configurable per job class | DelayedJob (DB polling is slow), Resque (older, less maintained), ActiveJob default (in-process, lost on restart) |
| 2026-01-12 | Service objects for all business logic, thin controllers | Controllers stay as HTTP adapters; service objects are testable without a request context | Fat models (mixed concerns, hard to test in isolation), fat controllers (impossible to reuse logic) |
| 2026-01-22 | `jsonb` columns for flexible attributes, not EAV or STI | Postgres `jsonb` is queryable, indexable, and avoids the complexity of EAV tables or a deep STI hierarchy | EAV (`attribute_value` table — join hell), STI (one big table with many NULLs), separate tables per type (migration overhead) |
| 2026-02-10 | RSpec + FactoryBot for tests, not Minitest | Team is familiar with RSpec; FactoryBot makes fixture management explicit; shared examples reduce duplication | Minitest (fine but less expressive for integration tests), fixtures (fragile, hard to maintain at scale) |
| 2026-03-02 | Pundit for authorization, not CanCanCan | Policy objects are plain Ruby, easy to unit test, one class per resource; explicit over magic | CanCanCan (ability file grows unbounded, hard to test in isolation), custom before_actions (duplicated across controllers) |
