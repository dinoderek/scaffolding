---
task_id: T-20260303-01
milestone_id: "M9"
status: planned
ui_impact: "no"
areas: "frontend,docs"
runtimes: "node,expo,sql,maestro"
gates_fast: "./scripts/quality-fast.sh frontend"
gates_slow: "./scripts/quality-slow.sh frontend"
docs_touched: "docs/specs/00-product.md,docs/specs/03-technical-architecture.md,docs/specs/milestones/M9-exercise-variations-and-fast-selection-foundation.md"
---

# Task Card

## Task metadata

- Task ID: `T-20260303-01`
- Title: M9 rollback undeployed variation foundation
- Status: `planned`
- Session date: `2026-03-03`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- Milestone spec: `docs/specs/milestones/M9-exercise-variations-and-fast-selection-foundation.md`
- Product overview: `docs/specs/00-product.md`
- Architecture: `docs/specs/03-technical-architecture.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`
- Project structure: `docs/specs/09-project-structure.md`

## Context Freshness (required at session start; update before edits)

- Verified current branch + HEAD commit: `TBD at execution start`
- Start-of-session sync completed per `docs/specs/04-ai-development-playbook.md` git sync workflow?: `TBD`
- Parent refs opened in this session:
  - `docs/specs/milestones/M9-exercise-variations-and-fast-selection-foundation.md`
  - `docs/specs/00-product.md`
  - `docs/specs/03-technical-architecture.md`
  - `docs/specs/06-testing-strategy.md`
  - `docs/specs/09-project-structure.md`
- Code/docs inventory freshness checks run:
  - variation schema inventory under `apps/mobile/src/data/schema/**`
  - variation repository/bootstrap inventory under `apps/mobile/src/data/**`
  - related tests under `apps/mobile/app/__tests__/**`
- Known stale references or assumptions:
  - prior M9 variation work was never deployed, so rollback does not need a released-user migration path
- Optional helper command:
  - `./scripts/task-bootstrap.sh docs/tasks/T-20260303-01-m9-rollback-undeployed-variation-foundation.md`

## Objective

Remove the undeployed key/value variation foundation and related compatibility logic so M9 can proceed on a clean tag-based baseline instead of carrying dead variation schema/runtime branches forward.

## Scope

### In scope

- Remove undeployed variation-specific local schema, migrations, seeds, repository APIs, and helper utilities that are no longer aligned with M9.
- Remove boot-time variation backfill and legacy `machineName` compatibility paths that only existed to support the discarded variation model.
- Remove or simplify tests that only validate the discarded variation behavior.
- Preserve any still-needed canonical exercise definition behavior only if it remains aligned with the revised M9 milestone scope.
- Update product/architecture/milestone docs to reflect that variation work has been intentionally rolled back.

### Out of scope

- New tag schema or tag persistence implementation.
- Recorder tag UI.
- Analytics implementation.
- Backend sync/API changes.

## UI Impact (required checkpoint)

- UI Impact?: `no`

## Acceptance criteria

1. Variation keys, values, exercise-owned variations, and related variation identity contracts are removed from the local M9 foundation.
2. Boot-time variation backfill and variation-specific migration/compatibility behavior are removed.
3. Remaining session/exercise persistence code compiles and runs without variation-specific branches.
4. Tests are updated so no active test suite depends on the discarded variation model.
5. Product, architecture, and milestone docs clearly describe the rollback and new tag direction.

## Docs touched (required)

- Planned docs/spec files to update and why:
  - `docs/specs/00-product.md` - replace variation decisions with tag decisions
  - `docs/specs/03-technical-architecture.md` - replace variation architecture decisions with tag decisions
  - `docs/specs/milestones/M9-exercise-variations-and-fast-selection-foundation.md` - revise milestone scope and task breakdown

## Testing and verification approach

- Planned checks/commands:
  - targeted tests covering any persistence/bootstrap paths touched by rollback
  - migration-generation canary if schema artifacts change (`npm run db:generate:canary`)
- Standard local gate usage:
  - `./scripts/quality-fast.sh frontend` (required)
  - `./scripts/quality-slow.sh frontend` (required; schema/bootstrap/runtime-sensitive rollback trigger)
- Test layers covered:
  - unit/repository cleanup checks
  - data-layer integration checks
  - native runtime data smoke via slow gate
- Execution triggers:
  - always for fast gate
  - slow gate required because rollback touches schema/bootstrap/runtime-sensitive persistence behavior
- Slow-gate triggers:
  - any change under `apps/mobile/src/data/schema/**`, `apps/mobile/drizzle/**`, or persistence bootstrap/repository paths
- Hosted/deployed smoke ownership: `N/A`
- CI/manual posture note: CI absent; local gate evidence required in completion note

## Implementation notes

- Planned files/areas allowed to change:
  - `apps/mobile/src/data/**`
  - `apps/mobile/drizzle/**`
  - related tests under `apps/mobile/**/__tests__/**`
  - `docs/specs/**`
- Project structure impact: no new top-level folders expected
- Constraints/assumptions:
  - rollback should prefer deletion/simplification over keeping compatibility branches for an undeployed feature
  - if a non-variation piece of the prior M9 work is still needed, keep it only with explicit rationale in the completion note

## Mandatory verify gates

- Standard local fast gate: `./scripts/quality-fast.sh frontend`
- Standard local slow gate: `./scripts/quality-slow.sh frontend`
- Optional closeout helper: `./scripts/task-closeout-check.sh docs/tasks/T-20260303-01-m9-rollback-undeployed-variation-foundation.md`
- Additional gate(s), if any:
  - `npm run db:generate:canary` when migration artifacts are regenerated

## Evidence

- Summary of removed schema/runtime pieces.
- Test evidence that the app still boots/persists correctly after rollback.
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
- Run `./scripts/task-closeout-check.sh docs/tasks/T-20260303-01-m9-rollback-undeployed-variation-foundation.md` (or document why `N/A`) before handoff.
