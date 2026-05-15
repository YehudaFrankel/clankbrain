# Error Log

| Date | Error | Root cause | Fix applied |
|------|-------|-----------|-------------|
| 2026-01-08 | `ActiveRecord::StatementInvalid: PG::UndefinedColumn` in production only | Migration ran but old code still referenced the renamed column — deploy order wrong | Deploy order: migrate → restart → deploy code. Never rename a column in one step; use the 4-step expand/contract pattern |
| 2026-01-22 | Sidekiq jobs silently not retrying after failure | `retry: false` was set in a base job class and inherited everywhere | Removed `retry: false` from base class; set explicitly only on jobs where retry would cause harm (e.g. duplicate emails) |
| 2026-02-07 | `ActionController::InvalidAuthenticityToken` for all POST requests in production | CSRF token not included in the Axios config — `X-CSRF-Token` header missing | Added `axios.defaults.headers.common['X-CSRF-Token'] = document.querySelector('meta[name="csrf-token"]').content` to the JS entrypoint |
| 2026-02-22 | `NoMethodError: undefined method 'name' for nil:NilClass` in a view | `@user.company.name` — `company` was nil for users without one; no guard | Used `@user.company&.name` throughout; added a `belongs_to :company, optional: true` declaration to suppress Rails 5+ warning |
| 2026-03-10 | Test suite randomly failing in CI — different failures each run | Tests shared global state via a class-level variable in a service object that wasn't reset between examples | Moved state to instance variables; wrapped shared state in `around(:each) { |ex| MyService.reset!; ex.run }` |
