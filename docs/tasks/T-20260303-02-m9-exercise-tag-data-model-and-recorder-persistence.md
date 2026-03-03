---
task_id: T-20260303-02
milestone_id: "M9"
status: planned
ui_impact: "no"
areas: "frontend,docs"
runtimes: "node,expo,sql,maestro"
gates_fast: "./scripts/quality-fast.sh frontend"
gates_slow: "./scripts/quality-slow.sh frontend"
docs_touched: "docs/specs/milestones/M9-exercise-variations-and-fast-selection-foundation.md"
---

# Task Card

## Task metadata

- Task ID: `T-20260303-02`
- Title: M9 exercise tag data model and recorder persistence
- Status: `planned`
- Session date: `2026-03-03`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- Milestone spec: `docs/specs/milestones/M9-exercise-variations-and-fast-selection-foundation.md`
- Architecture: `docs/specs/03-technical-architecture.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`
- Project structure: `docs/specs/09-project-structure.md`

## Context Freshness (required at session start; update before edits)

- Verified current branch + HEAD commit: `TBD at execution start`
- Start-of-session sync completed per `docs/specs/04-ai-development-playbook.md` git sync workflow?: `TBD`
- Parent refs opened in this session:
  - `docs/specs/milestones/M9-exercise-variations-and-fast-selection-foundation.md`
  - `docs/specs/03-technical-architecture.md`
  - `docs/specs/06-testing-strategy.md`
  - `docs/specs/09-project-structure.md`
- Code/docs inventory freshness checks run:
  - session exercise persistence inventory under `apps/mobile/src/data/**`
  - recorder draft persistence inventory under `apps/mobile/src/session-recorder/**`
- Known stale references or assumptions:
  - assumes the rollback task has removed the discarded variation model first
- Optional helper command:
  - `./scripts/task-bootstrap.sh docs/tasks/T-20260303-02-m9-exercise-tag-data-model-and-recorder-persistence.md`

## Objective

Implement the local data contract for per-log exercise tags, including persistence, normalization, duplicate prevention, and recent-tag queries scoped to the same exercise definition.

## Scope

### In scope

- Add local schema/entities needed to store `0..n` tags on a logged exercise.
- Add/update repository contracts to read/write tags alongside logged exercises.
- Define and enforce tag normalization rules for duplicate detection on one logged exercise.
- Add repository/query support to list prior tags used for the same exercise definition for suggestion UIs.
- Update tests for persistence, normalization, duplicate rejection, and recent-tag query behavior.

### Out of scope

- Recorder UI implementation.
- Analytics implementation.
- Backend sync/API implementation.
- Global tag management or tag rename flows.

## UI Impact (required checkpoint)

- UI Impact?: `no`

## Acceptance criteria

1. Schema supports `0..n` tags attached to a logged exercise.
2. Repository APIs exist to save, remove, and restore tags with session drafts/completed sessions.
3. Duplicate tags on the same logged exercise are blocked using explicit normalization rules.
4. Query support exists for recent/prior tags scoped to the same exercise definition.
5. No variation identity/model is reintroduced to achieve tag persistence.
6. Targeted tests cover normalization, duplicates, restore behavior, and same-exercise suggestion queries.

## Docs touched (required)

- Planned docs/spec files to update and why:
  - `docs/specs/milestones/M9-exercise-variations-and-fast-selection-foundation.md` - progress/status update if persistence details are clarified

## Testing and verification approach

- Planned checks/commands:
  - targeted schema/repository tests in `apps/mobile`
  - migration-generation canary if schema artifacts change (`npm run db:generate:canary`)
  - focused persistence tests for draft reload/completed-session restore paths
- Standard local gate usage:
  - `./scripts/quality-fast.sh frontend` (required)
  - `./scripts/quality-slow.sh frontend` (required; runtime-sensitive migration/data smoke trigger)
- Test layers covered:
  - unit (normalization/query helpers)
  - data-layer integration (SQLite schema + persistence path)
  - native runtime data smoke via slow gate
- Execution triggers:
  - always for fast gate
  - slow gate required because schema/migrations/data bootstrapping are modified
- Slow-gate triggers:
  - any change under `apps/mobile/src/data/schema/**`, `apps/mobile/drizzle/**`, or persistence bootstrap/repository paths
- Hosted/deployed smoke ownership: `N/A`
- CI/manual posture note: no CI configured; local gate evidence required in completion note

## Implementation notes

- Planned files/areas allowed to change:
  - `apps/mobile/src/data/schema/**`
  - `apps/mobile/src/data/**`
  - `apps/mobile/drizzle/**`
  - related tests under `apps/mobile/**/__tests__/**`
- Project structure impact: no new top-level folders expected
- Constraints/assumptions:
  - normalize tags by trim + internal whitespace collapse + case-insensitive uniqueness unless implementation evidence justifies a different rule
  - keep recent-tag queries exercise-scoped rather than introducing a global tag catalog

## Mandatory verify gates

- Standard local fast gate: `./scripts/quality-fast.sh frontend`
- Standard local slow gate: `./scripts/quality-slow.sh frontend`
- Optional closeout helper: `./scripts/task-closeout-check.sh docs/tasks/T-20260303-02-m9-exercise-tag-data-model-and-recorder-persistence.md`
- Additional gate(s), if any:
  - `npm run db:generate:canary` when migration artifacts are regenerated

## Evidence

- Schema/repository diff summary for tag persistence.
- Targeted test summary for normalization, duplicates, restore, and query behavior.
- Local gate results summary (`quality-fast` + `quality-slow frontend`).
- Manual verification summary (CI absent).

## Completion note (fill at end per `docs/specs/04-ai-development-playbook.md`)

- What changed:
- What tests ran:
- What remains:

## Status update checklist (mandatory at closeout)

- Update `Status` to `completed` or `blocked`.
- Ensure completion note is filled before handoff.
- If significant project-structure changes were made, update `docs/specs/09-project-structure.md` and mention it in completion note.
- Update parent milestone task breakdown/status in the same session.
- Run `./scripts/task-closeout-check.sh docs/tasks/T-20260303-02-m9-exercise-tag-data-model-and-recorder-persistence.md` (or document why `N/A`) before handoff.
