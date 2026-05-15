# Rejected Approaches

| Approach | Why rejected |
|----------|-------------|
| ActiveRecord callbacks for cross-model side effects | `after_create :notify_user` in the model triggered emails during seed, tests, and imports. Side effects belong in service objects where they can be controlled. Removed all cross-model callbacks from models. |
| Nested routes more than 2 levels deep | `/projects/:project_id/tasks/:task_id/comments/:id` made URL helpers unreadable and path helpers error-prone. Flattened to shallow routes. Rails docs say the same — never go deeper than 2. |
| `respond_to` blocks for HTML + JSON in the same controller | Every action had a 6-line `respond_to` block. Split into a separate API namespace (`/api/v1/`) with its own controllers. HTML controllers render views; API controllers render JSON. Never mixed again. |
| Storing uploaded files in `public/uploads` | Worked locally, vanished on every Heroku deploy (ephemeral filesystem). Switched to Active Storage with S3. Never store user uploads on the local filesystem. |
| `rails_admin` for the admin panel | Mounted a full engine that was hard to customize, added 40+ routes, and had security implications to harden. Replaced with a hand-built `/admin` namespace — 3 controllers, full control, no gem surface area. |
