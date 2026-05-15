# Lessons Learned

<!-- Loaded every session start. 50 sessions on a Java/Spring Boot + SQL Server project. -->

| Date | What went wrong | Rule to prevent it |
|------|----------------|-------------------|
| 2026-01-05 | `@Transactional` on a `private` method — proxy didn't intercept it, transaction never opened | `@Transactional` only works on `public` methods called through the Spring proxy, not `this.method()` |
| 2026-01-08 | `NullPointerException` from `Optional.get()` without `isPresent()` check | Always use `orElseThrow()`, `orElse()`, or `ifPresent()` — never call `.get()` directly |
| 2026-01-12 | `LazyInitializationException` on entity access outside transaction | Load lazy associations inside the service method (still in transaction), not in the controller |
| 2026-01-15 | `@Autowired` on a `static` field — injection silently failed | Never `@Autowired` static fields; inject into constructor or instance field |
| 2026-01-19 | `List<String>` as a `@RequestParam` — Spring didn't parse comma-separated string | Use `@RequestParam List<String>` with `?ids=1&ids=2` format OR split manually; comma-join doesn't auto-parse |
| 2026-01-22 | `EntityManager.merge()` called on a detached entity with stale data — overwrote DB changes | Never `merge()` a detached entity from user input; load fresh from DB then update fields |
| 2026-01-26 | `@Scheduled` fired on every instance in a clustered deploy — duplicate processing | Use `ShedLock` for distributed scheduling; `@Scheduled` has no cluster awareness |
| 2026-01-30 | `ObjectMapper` created per-request — expensive and inconsistent config | Inject a single shared `@Bean ObjectMapper`; never `new ObjectMapper()` in a method body |
| 2026-02-03 | JDBC batch insert hit identity column explicitly — `Cannot insert explicit value for IDENTITY column` | Never include identity columns in INSERT column lists; let SQL Server generate them |
| 2026-02-07 | `@Value` field was null in `@PostConstruct` — injection order issue | Use constructor injection for fields needed in `@PostConstruct`; `@Value` + field injection is unreliable at construction time |
| 2026-02-10 | `String.format()` in SQL — SQL injection vector | Never concatenate user input into SQL; use `JdbcTemplate` named params or `PreparedStatement` |
| 2026-02-14 | `ResponseEntity` returned `HttpStatus.OK` on validation failure — client treated it as success | Validation failures return `400 BAD_REQUEST`; domain errors return `422 UNPROCESSABLE_ENTITY` |
| 2026-02-18 | `@Cacheable` on a method that returned `null` — cached the null, subsequent calls all returned null | Set `unless = "#result == null"` on `@Cacheable` to skip caching null results |
| 2026-02-22 | Thread pool exhausted under load — all requests queued | Default Spring MVC thread pool is 200; configure `server.tomcat.threads.max` based on profiling |
| 2026-02-26 | Lombok `@Data` on a JPA entity — `hashCode()` used all fields, caused issues in sets/maps with lazy fields | Use `@EqualsAndHashCode(onlyExplicitlyIncluded = true)` + `@EqualsAndHashCode.Include` on the ID field only |
| 2026-03-02 | `@OneToMany` without `cascade = REMOVE` — orphan child rows on parent delete | Set `cascade = CascadeType.ALL, orphanRemoval = true` for owned relationships |
| 2026-03-06 | `RestTemplate` used for external API call — blocking, deprecated | Use `WebClient` (non-blocking) or `RestClient` (Spring 6.1+); `RestTemplate` is in maintenance mode |
| 2026-03-10 | Jackson serialized all entity fields including lazy proxies — infinite recursion on bidirectional relations | Use `@JsonManagedReference`/`@JsonBackReference` or `@JsonIgnore` on the back-reference side |
| 2026-03-14 | `@Async` method called from the same class — proxy bypassed, ran synchronously | `@Async` requires calling from a different Spring bean; extract async methods to a separate `@Service` |
| 2026-03-18 | Schema migration ran without a backup — data loss from a bad `ALTER TABLE` | All schema changes: snapshot backup first, migration in a transaction, rollback script ready |
