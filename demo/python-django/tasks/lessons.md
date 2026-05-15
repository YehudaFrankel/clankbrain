# Lessons Learned

<!-- Loaded every session start. 50 sessions on a Python/Django + Postgres project. -->

| Date | What went wrong | Rule to prevent it |
|------|----------------|-------------------|
| 2026-01-05 | `QuerySet` was evaluated inside a loop — N+1 queries on every page load | Use `select_related()` for FK lookups and `prefetch_related()` for M2M before iterating |
| 2026-01-08 | `default=[]` on a model field — all instances shared the same list object | Never use mutable defaults on model fields; use `default=list` (callable) instead |
| 2026-01-12 | Forgot `transaction.atomic()` — partial write left orphan rows on IntegrityError | Any multi-step write must be wrapped in `with transaction.atomic()` |
| 2026-01-15 | Celery task called `Model.objects.get()` — raised `DoesNotExist` when object deleted between queue and execution | Always use `.filter().first()` in Celery tasks; tasks must handle missing objects gracefully |
| 2026-01-19 | `django.test.Client` was used for API tests — didn't respect DRF auth classes | Use `rest_framework.test.APIClient` for any DRF endpoint test |
| 2026-01-22 | Migration ran in prod without `--fake` after manual SQL — `django_migrations` out of sync | Always record manual SQL changes with a `--fake` migration; never let the migrations table drift |
| 2026-01-26 | Signal handler raised an exception — silently swallowed, the view returned 200 anyway | Wrap signal handlers in try/except and log errors explicitly; signals don't propagate exceptions |
| 2026-01-30 | `settings.DEBUG = True` leaked into a test — emails went to the real SMTP server | Test settings must set `EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'` |
| 2026-02-03 | Used `Model.objects.all()` in a `__str__` — triggered DB query on admin list render | Never put queryset calls inside `__str__` — use only fields already on the instance |
| 2026-02-07 | Serializer `validated_data` was mutated before `.save()` — wrong data written | Never mutate `validated_data`; pass overrides as kwargs to `.save(field=value)` |
| 2026-02-10 | Raw `request.POST` used instead of serializer — bypassed validation | All writes go through a serializer; never read `request.POST` or `request.data` directly in a view |
| 2026-02-14 | `auto_now=True` on `updated_at` — couldn't set it manually in bulk import | Use `auto_now=False` + `default=now`; set explicitly in `save()` override when needed |
| 2026-02-18 | Forgot `related_name` on two FK fields to the same model — Django raised `clash` error on migrate | Always set `related_name` when two FKs on the same model point to the same target |
| 2026-02-22 | Celery beat schedule in `settings.py` — two workers both ran the same periodic task | Use Django-celery-beat DB scheduler; only one beat process per deployment |
| 2026-02-26 | `order_by()` on a `QuerySet` reset the existing ordering — different results per call site | Explicit `order_by('id')` at the final queryset; never rely on default model ordering in views |
| 2026-03-02 | Used `|` (OR) on QuerySets without `distinct()` — duplicate rows in results | Always add `.distinct()` when combining QuerySets with `|` or `Q()` OR conditions |
| 2026-03-06 | `FileField` stored absolute path — broke after moving storage backend | Store relative paths only; reconstruct full URL via `field.url` property |
| 2026-03-10 | `cache.set()` without timeout — key lived forever, stale data in prod | Always pass explicit `timeout` to `cache.set()`; never rely on the default |
| 2026-03-14 | Forgot `str(uuid)` before storing in session — UUID not JSON-serializable | Cast UUIDs to `str` before any JSON serialization or session storage |
| 2026-03-18 | `bulk_create()` skipped `pre_save` signals — audit log rows missing | `bulk_create` bypasses signals; call `save()` individually when signals matter, or log explicitly |
