# Architectural Decisions

| Date | Decision | Why | Alternatives rejected |
|------|----------|-----|----------------------|
| 2026-01-05 | DRF ViewSets for all API endpoints | Consistent router registration, built-in filtering/pagination via DRF generics | APIView (too much boilerplate per endpoint), Django views (no DRF auth integration) |
| 2026-01-12 | Celery + Redis for async tasks | Mature, battle-tested, Redis already in stack for caching | Django Q (smaller community), RQ (less feature-complete), inline threads (no retry, no monitoring) |
| 2026-01-22 | Custom User model from session 1 | Django docs explicitly say to do this before first migration — impossible to change cleanly after | AbstractUser is fine but AbstractBaseUser gives full control; going back is painful |
| 2026-02-10 | django-filter for API filtering | Declarative, works with DRF generics, zero boilerplate for standard filters | Manual `request.query_params` parsing (error-prone), django-rest-framework-filters (abandoned) |
| 2026-03-02 | Whitenoise for static files | No extra infra for static serving in prod; S3 only for user-uploaded media | nginx static serving (extra config), S3 for everything (latency for static assets) |
