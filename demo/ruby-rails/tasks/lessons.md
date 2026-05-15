# Lessons Learned

<!-- Loaded every session start. 50 sessions on a Ruby on Rails + Postgres project. -->

| Date | What went wrong | Rule to prevent it |
|------|----------------|-------------------|
| 2026-01-05 | `before_action` ran on every action including ones that didn't need auth | Always scope `before_action` with `only:` or `except:`; never leave it unscoped |
| 2026-01-08 | N+1 query in a view — `post.comments` called inside `.each` loop | Use `includes(:comments)` in the controller query; install `bullet` gem in development to catch these |
| 2026-01-12 | `attr_accessible` mass assignment — allowed a `role` field to be set via form params | Always use strong params in the controller; never trust raw `params` in `create`/`update` |
| 2026-01-15 | `has_many :through` association loaded the join table twice in one request | Preload with `includes` using the through association name, not the join table directly |
| 2026-01-19 | `Time.now` used in a model — returned server local time, broke UTC comparisons | Always use `Time.current` (respects `config.time_zone`) or `Time.zone.now`; never `Time.now` |
| 2026-01-22 | Migration added a NOT NULL column without a default — broke deploys on existing rows | Always add a default when adding NOT NULL columns to tables with existing data; use a two-step migration for large tables |
| 2026-01-26 | `update_attribute` used — skips validations and callbacks silently | Use `update` (runs validations) unless you explicitly need to bypass — then document why |
| 2026-01-30 | Sidekiq job called `User.find` — raised `ActiveRecord::RecordNotFound` when user deleted between enqueue and execute | Use `User.find_by(id: id)` in jobs; always handle nil return; jobs must be idempotent |
| 2026-02-03 | `serialize` on a model attribute stored as YAML — broke when class name changed | Use `store_accessor` with JSON column instead of `serialize`; YAML format ties you to class names |
| 2026-02-07 | `rescue Exception` caught `SignalException` — process couldn't be killed with Ctrl-C | Never `rescue Exception`; rescue `StandardError` or specific exception classes only |
| 2026-02-10 | `dependent: :destroy` on a large association — deleted 50k rows one by one in a request cycle | Use `dependent: :delete_all` for large associations (skips callbacks); or background job for very large sets |
| 2026-02-14 | Scope chained with `.or` returned wrong results — `OR` had lower precedence than expected | Wrap each side of `.or` in its own scope call; use parentheses in raw SQL for complex OR conditions |
| 2026-02-18 | `render json: @record` exposed all attributes including password_digest | Always use a serializer or explicit `as_json(only: [...])` — never render an AR object directly |
| 2026-02-22 | `counter_cache` column got out of sync after bulk deletes | `counter_cache` only updates on single-record destroy; use `User.reset_counters(id, :posts)` after bulk ops |
| 2026-02-26 | Mailer called inline in the controller — slow SMTP blocked the response | All mail goes through `deliver_later` (Sidekiq); never `deliver_now` in a request cycle |
| 2026-03-02 | `validates :email, uniqueness: true` had a race condition — two simultaneous signups created duplicates | Uniqueness validations are not race-safe; always back them with a DB unique index |
| 2026-03-06 | `pluck(:id)` on a large table loaded all IDs into memory | Use `find_each` or `in_batches` for large table operations; `pluck` on 1M rows = 1M integers in RAM |
| 2026-03-10 | Factory created associated records on every test — suite slowed to 4 minutes | Use `build_stubbed` for unit tests; only `create` when the test needs DB persistence |
| 2026-03-14 | `I18n.t` called with a missing key — returned a `<span>` translation missing tag in production | Set `config.i18n.raise_on_missing_translations = true` in test; catch missing keys before they ship |
| 2026-03-18 | `after_commit` callback fired in tests — caused unexpected side effects in unrelated specs | Wrap `after_commit` callbacks with `if Rails.env.test?` guard or use `after_save` for test-safe alternatives |
