# Architectural Decisions

| Date | Decision | Why | Alternatives rejected |
|------|----------|-----|----------------------|
| 2026-01-05 | Constructor injection everywhere, no field injection | Immutable dependencies, easy to test (no Spring context needed), catches missing deps at startup | `@Autowired` field injection (hard to test, hides dependencies), setter injection (optional deps only) |
| 2026-01-12 | Service layer owns all `@Transactional` boundaries | Controllers are thin HTTP adapters; transactions belong to the domain, not the transport layer | `@Transactional` on controllers (mixes concerns), repository-level transactions (too granular for multi-step ops) |
| 2026-01-22 | DTOs for all API boundaries — entities never serialized directly | Decouples API contract from DB schema; prevents accidental lazy-load serialization; controls what's exposed | Directly serializing entities (Jackson + Hibernate = pain), MapStruct (extra codegen complexity for this project size) |
| 2026-02-10 | Flyway for DB migrations, not Hibernate `ddl-auto` | Deterministic, version-controlled, prod-safe. `ddl-auto=update` is not safe for production | Liquibase (XML-heavy), `ddl-auto=update` (destructive, uncontrolled), manual SQL (no version tracking) |
| 2026-03-02 | `GlobalExceptionHandler` with `@ControllerAdvice` for all error responses | Consistent error shape across all endpoints; exception translation in one place | Per-controller try/catch (inconsistent, duplicated), `ResponseStatusException` inline (loses context) |
