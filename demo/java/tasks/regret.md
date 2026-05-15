# Rejected Approaches

| Approach | Why rejected |
|----------|-------------|
| Hibernate `ddl-auto=update` in production | Silently dropped a column with data when an entity field was renamed. Flyway migrations only from that point on. `spring.jpa.hibernate.ddl-auto=validate` in prod at most. |
| `@Transactional(readOnly = true)` on every GET method | Added cognitive overhead and a subtle bug: a "read-only" transaction that triggered a lazy load inside a `@Cacheable` method caused a `LazyInitializationException` after cache miss. Removed readOnly from most cases — the performance gain is negligible on this stack. |
| Generic `RuntimeException` for all domain errors | Controller advice couldn't distinguish between "user not found" and "internal server error" — both returned 500. Created typed exceptions (`ResourceNotFoundException`, `ValidationException`) mapped to specific HTTP status codes. |
| `@SpringBootTest` for every test | Spun up full application context for unit tests — 8 second startup per test class. Now: `@ExtendWith(MockitoExtension.class)` for unit tests, `@SpringBootTest` only for integration tests that truly need it. |
| Returning `List` from service methods | Callers couldn't distinguish "empty result" from "query not supported here." Switched to `Page<T>` for paginated endpoints and typed result wrappers for everything else. |
