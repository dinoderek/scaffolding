---
task_id: T-20260302-06
milestone_id: "M11"
status: planned
ui_impact: "no"
areas: "frontend,docs,cross-stack"
runtimes: "node,expo,docs"
gates_fast: "./scripts/quality-fast.sh frontend"
gates_slow: "N/A"
docs_touched: "docs/specs/06-testing-strategy.md,docs/specs/milestones/M11-frontend-backend-sync-integration.md,apps/mobile/app/__tests__/**,apps/mobile/src/**"
---

# Task Card

## Task metadata

- Task ID: `T-20260302-06`
- Title: M11 sync mock-backend scenarios and regression coverage
- Status: `planned`
- Session date: `2026-03-02`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- Milestone spec: `docs/specs/milestones/M11-frontend-backend-sync-integration.md`
- Architecture: `docs/specs/03-technical-architecture.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`
- Project structure: `docs/specs/09-project-structure.md`
- Sync API contract: `supabase/session-sync-api-contract.md`

## Context Freshness (required at session start; update before edits)

- Verified current branch + HEAD commit: `TBD at execution start`
- Start-of-session sync completed per `docs/specs/04-ai-development-playbook.md` git sync workflow?: `TBD`
- Parent refs opened in this session:
  - `docs/specs/milestones/M11-frontend-backend-sync-integration.md`
  - `docs/specs/03-technical-architecture.md`
  - `docs/specs/06-testing-strategy.md`
  - `supabase/session-sync-api-contract.md`
- Code/docs inventory freshness checks run:
  - current sync-engine test surface inventory
- Known stale references or assumptions:
  - assumes earlier M11 implementation tasks established a testable sync orchestrator boundary
- Optional helper command:
  - `./scripts/task-bootstrap.sh docs/tasks/T-20260302-06-m11-sync-mock-backend-scenarios-and-regression-coverage.md`

## Objective

Build the broad sync-scenario test matrix using mocks/fakes so the sync engine's correctness is locked down before relying on the smaller real-backend `E2E` lane.

## Scope

### In scope

- Add mock/fake backend coverage for the core sync scenarios.
- Verify local/frontend-ahead, backend-ahead, recovery, and conflict semantics.
- Verify auth-gated disabled behavior and delete/tombstone parity where supported.
- Update project-level testing docs if the scenario matrix changes the shared contract.

### Out of scope

- Real local-Supabase `E2E` orchestration (handled by Task 07).
- New backend contract changes.

## UI Impact (required checkpoint)

- UI Impact?: `no`

## Acceptance criteria

1. Mock/fake backend tests cover the agreed sync scenario matrix for M11.
2. Tests cover both success and degraded/recovery paths.
3. Auth-disabled and offline/backend-unavailable paths are explicitly tested.
4. Conflict path or conflict-avoidance semantics are explicitly tested.
5. `docs/specs/06-testing-strategy.md` is updated if the stable sync coverage contract changes.

## Docs touched (required)

- Planned docs/spec files to update and why:
  - `docs/specs/milestones/M11-frontend-backend-sync-integration.md` - update verification summary if needed
  - `docs/specs/06-testing-strategy.md` - document final sync scenario matrix if refined

## Testing and verification approach

- Planned checks/commands:
  - targeted sync-scenario test files
  - `./scripts/quality-fast.sh frontend`
- Standard local gate usage:
  - `./scripts/quality-fast.sh frontend`
  - `./scripts/quality-slow.sh frontend`: `N/A by default`
- Test layers covered: mobile unit/integration with mocks/fakes
- Execution triggers: always
- Slow-gate triggers:
  - `N/A` unless this task unexpectedly changes runtime-sensitive mobile wiring
- Hosted/deployed smoke ownership: `N/A`
- CI/manual posture note: no CI; local frontend tests are required

## Implementation notes

- Planned files/areas allowed to change:
  - `apps/mobile/app/__tests__/**`
  - `apps/mobile/src/**`
  - `docs/specs/milestones/M11-frontend-backend-sync-integration.md`
  - `docs/specs/06-testing-strategy.md`
- Project structure impact: `no structure change expected`
- Constraints/assumptions:
  - keep the scenario matrix readable and named by behavior, not just by internal helper functions

## Mandatory verify gates

- Standard local fast gate: `./scripts/quality-fast.sh frontend`
- Standard local slow gate: `N/A unless runtime-sensitive trigger conditions arise`
- Optional closeout validation helper: `./scripts/task-closeout-check.sh docs/tasks/T-20260302-06-m11-sync-mock-backend-scenarios-and-regression-coverage.md`

## Evidence

- Scenario matrix summary.
- Test file/coverage summary for sync behaviors.
- Manual verification summary: local frontend fast gate executed because CI is absent.

## Completion note

- What changed:
- What tests ran:
- What remains:

## Status update checklist

- Update `Status` to `completed`, `blocked`, or `outdated`.
- If `Status = completed` or `outdated`, move the task card to `docs/tasks/complete/` and update affected references in the same session.
- Ensure completion note is filled before handoff.
- If the task changed significant cross-cutting behavior, update `docs/specs/03-technical-architecture.md`, `docs/specs/04-ai-development-playbook.md`, and `docs/specs/06-testing-strategy.md` in the same session as applicable.
- Update parent milestone task breakdown/status in the same session.
