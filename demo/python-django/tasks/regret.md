# Rejected Approaches

| Approach | Why rejected |
|----------|-------------|
| Generic `APIView` for every endpoint | Wrote the same pagination, filtering, and auth boilerplate 12 times before switching to ViewSets. ViewSets with routers cut endpoint code by 60%. Never go back. |
| Storing session data in cookies | Cookie size limit (4KB) hit immediately once we added cart data. Switched to DB-backed sessions. `SESSION_ENGINE = 'django.contrib.sessions.backends.db'`. |
| `django-debug-toolbar` in staging | Exposed query counts and internal state to anyone who hit staging. Now toolbar only loads when `INTERNAL_IPS` includes the request IP, and only in local dev. |
| Inline Celery tasks in `views.py` | Tasks grew complex and needed their own tests. Moved all tasks to `tasks.py` per app. Never define tasks inline in views. |
| `EmailMultiAlternatives` called synchronously in the request cycle | SMTP latency caused 2-3 second response times. All email now goes through Celery. If Celery is down, emails queue in Redis — not lost. |
