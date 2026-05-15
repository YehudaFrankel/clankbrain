# Error Log

| Date | Error | Root cause | Fix applied |
|------|-------|-----------|-------------|
| 2026-01-08 | `BeanCreationException` on startup after adding new `@Service` | Circular dependency: ServiceA → ServiceB → ServiceA | Broke cycle by extracting shared logic into a third `@Component`; never use `@Lazy` to paper over cycles |
| 2026-01-22 | `could not initialize proxy — no Session` in production only | Lazy-loaded field accessed after transaction closed in a scheduled job | Added `@Transactional` to the scheduler method; eager-loaded the field in the repository query |
| 2026-02-07 | `DataIntegrityViolationException` on concurrent inserts — duplicate key | Race condition: two requests checked existence then both inserted | Added `ON CONFLICT DO NOTHING` (Postgres) / unique index + retry logic; removed the check-then-insert pattern |
| 2026-02-22 | All endpoints returned 403 after adding Spring Security | `@EnableWebSecurity` default policy changed in Spring Boot 3 — all routes required auth | Explicitly configured `SecurityFilterChain` bean with permit/authenticate rules; never rely on defaults |
| 2026-03-10 | `StackOverflowError` in Jackson serialization | Bidirectional `@OneToMany`/`@ManyToOne` without `@JsonIgnore` on back-reference — infinite recursion | Added `@JsonManagedReference` on parent, `@JsonBackReference` on child; added test that serializes every entity type |
