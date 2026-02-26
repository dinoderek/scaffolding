# Task Cards

Store per-session task cards here.

Naming convention:

- `T-YYYYMMDD-01-<short-name>.md`
- `T-YYYYMMDD-02-<short-name>.md`

Each task card must reference:

1. `docs/specs/00-mvp-deliverables.md`
2. `docs/specs/milestones/<milestone-id>.md`
3. Relevant project directives/specs

Use template:

- `docs/specs/templates/task-card-template.md`

Recommended task authoring helpers:

1. `./scripts/task-bootstrap.sh <task-card-path>` at session start to populate/check `Context Freshness`.
2. `./scripts/task-closeout-check.sh <task-card-path>` before handoff to catch missing status/completion/milestone updates.

UI/UX task authoring reminders (see template for exact fields):

1. Keep the `UI Impact` checkpoint and set it to `yes` or `no`.
2. If `UI Impact = yes`, keep the `UX Contract` section and UI parent refs (`docs/specs/08-ux-delivery-standard.md`, `docs/specs/ui/README.md`).
3. Fill `Docs touched` with exact `docs/specs/ui/*.md` updates (or explicit `no update` rationale) and a tokens/primitives compliance statement.
4. Add UI acceptance criteria for primitives/tokens usage and route/navigation doc updates when route contracts change.

Machine-readable metadata (new task cards, recommended):

1. Keep the YAML frontmatter block from the template and update it as the task evolves.
2. Treat the markdown body as the human-authoritative source; frontmatter exists to support lightweight tooling/checks.
