# Error Log

| Date | Error | Root cause | Fix applied |
|------|-------|-----------|-------------|
| 2026-01-08 | `RelatedObjectDoesNotExist` on `user.profile` | `Profile` created via signal but signal didn't fire in tests using `User.objects.create()` | Use `User.objects.create_user()` in tests; it triggers the signal. Added to test fixtures. |
| 2026-01-19 | `django.db.utils.OperationalError: no such table` in CI | Test DB not migrated before test run; CI script called `pytest` without `--reuse-db` | CI script now runs `python manage.py migrate --run-syncdb` before pytest |
| 2026-02-03 | Celery task silently not executing — no error, no result | `CELERY_TASK_ALWAYS_EAGER = True` was set in test settings but not cleared in staging | Staging settings now explicitly set `CELERY_TASK_ALWAYS_EAGER = False` |
| 2026-02-22 | 500 on file upload — `SuspiciousFileOperation` | `upload_to` path contained `../` from user-supplied filename | Sanitize filename with `os.path.basename()` before passing to `upload_to`; never trust `request.FILES` name directly |
| 2026-03-10 | Serializer returned stale data after `.save()` | Serializer instance was re-used after save — `data` property caches the pre-save state | Always instantiate a fresh serializer for the response: `return Response(MySerializer(instance).data)` |
