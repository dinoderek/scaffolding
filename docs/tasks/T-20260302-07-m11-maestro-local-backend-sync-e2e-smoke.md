---
task_id: T-20260302-07
milestone_id: "M11"
status: planned
ui_impact: "no"
areas: "frontend,backend,cross-stack,docs"
runtimes: "expo,maestro,supabase,docs"
gates_fast: "./scripts/quality-fast.sh frontend"
gates_slow: "./scripts/quality-slow.sh frontend"
docs_touched: "docs/specs/06-testing-strategy.md,docs/specs/11-maestro-runtime-and-testing-conventions.md,docs/specs/milestones/M11-frontend-backend-sync-integration.md,apps/mobile/.maestro/**,apps/mobile/scripts/**,e2e/**"
---

# Task Card

## Task metadata

- Task ID: `T-20260302-07`
- Title: M11 Maestro local-backend sync E2E smoke
- Status: `planned`
- Session date: `2026-03-02`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- Milestone spec: `docs/specs/milestones/M11-frontend-backend-sync-integration.md`
- Architecture: `docs/specs/03-technical-architecture.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`
- Project structure: `docs/specs/09-project-structure.md`
- Maestro runtime contract: `docs/specs/11-maestro-runtime-and-testing-conventions.md`
- Sync API contract: `supabase/session-sync-api-contract.md`

## Context Freshness (required at session start; update before edits)

- Verified current branch + HEAD commit: `TBD at execution start`
- Start-of-session sync completed per `docs/specs/04-ai-development-playbook.md` git sync workflow?: `TBD`
- Parent refs opened in this session:
  - `docs/specs/milestones/M11-frontend-backend-sync-integration.md`
  - `docs/specs/03-technical-architecture.md`
  - `docs/specs/06-testing-strategy.md`
  - `docs/specs/11-maestro-runtime-and-testing-conventions.md`
  - `supabase/session-sync-api-contract.md`
- Code/docs inventory freshness checks run:
  - Maestro flow/runtime inventory
  - local Supabase wrapper inventory
- Known stale references or assumptions:
  - assumes prior M11 tasks provide a runnable sync engine and an auth/session harness for test users
- Optional helper command:
  - `./scripts/task-bootstrap.sh docs/tasks/T-20260302-07-m11-maestro-local-backend-sync-e2e-smoke.md`

## Objective

Add the first real cross-stack proof path that launches the mobile runtime, uses local Supabase, performs a sync-relevant mobile action, and verifies that the backend reflects the change.

## Scope

### In scope

- Add or update the orchestration path that starts local backend dependencies and runs the sync `E2E`.
- Extend the existing `Maestro` coverage with one sync-focused flow.
- Verify backend state after the mobile flow completes.
- Record artifacts/logs under the canonical Maestro artifact root.
- Update project-level testing/Maestro docs if the shared runtime contract changes.

### Out of scope

- Broad multi-scenario `E2E` coverage.
- Hosted/cloud `E2E` execution.

## UI Impact (required checkpoint)

- UI Impact?: `no`

## Acceptance criteria

1. A repeatable local command/wrapper exists for the first sync `E2E` smoke.
2. The flow uses local backend runtime plus mobile runtime and verifies backend-observable sync success.
3. Required `Maestro` artifacts/logs are written under the canonical artifact root.
4. `docs/specs/06-testing-strategy.md` and `docs/specs/11-maestro-runtime-and-testing-conventions.md` are updated if the shared runtime/testing contract changes.
5. Any new cross-stack orchestration path is documented in the milestone/task docs and project-structure docs if it becomes canonical.

## Docs touched (required)

- Planned docs/spec files to update and why:
  - `docs/specs/milestones/M11-frontend-backend-sync-integration.md` - record the `E2E` proof path
  - `docs/specs/06-testing-strategy.md` - document the new cross-stack sync smoke lane
  - `docs/specs/11-maestro-runtime-and-testing-conventions.md` - update runtime/testing contract if orchestration expectations change
  - `docs/specs/09-project-structure.md` - update only if `e2e/**` or other new canonical paths are introduced

## Testing and verification approach

- Planned checks/commands:
  - `./scripts/quality-fast.sh frontend`
  - `./scripts/quality-slow.sh frontend`
  - backend-local wrapper(s) needed by the new sync `E2E` flow
- Standard local gate usage:
  - `./scripts/quality-fast.sh frontend`
  - `./scripts/quality-slow.sh frontend`
- Test layers covered: `Maestro` + local `Supabase` cross-stack `E2E`
- Execution triggers: always
- Slow-gate triggers:
  - required because this task changes `Maestro`/cross-runtime behavior
- Hosted/deployed smoke ownership: future cloud-environment milestone for hosted smoke; this task is local-only
- CI/manual posture note: no CI; local simulator/backend run with artifact capture is required

## Implementation notes

- Planned files/areas allowed to change:
  - `apps/mobile/.maestro/**`
  - `apps/mobile/scripts/**`
  - `supabase/scripts/**`
  - `e2e/**` if a repo-level orchestration path is introduced
  - `docs/specs/milestones/M11-frontend-backend-sync-integration.md`
  - `docs/specs/06-testing-strategy.md`
  - `docs/specs/11-maestro-runtime-and-testing-conventions.md`
  - `docs/specs/09-project-structure.md` if new canonical paths are introduced
- Project structure impact:
  - possible `e2e/**` introduction; document it if it becomes canonical rather than ad hoc
- Constraints/assumptions:
  - follow the locked Maestro reset terminology and artifact expectations from the M10 contract

## Mandatory verify gates

- Standard local fast gate: `./scripts/quality-fast.sh frontend`
- Standard local slow gate: `./scripts/quality-slow.sh frontend`
- Additional gate(s), if any:
  - backend-local runtime and contract wrapper(s) needed by the new cross-stack command
- Optional closeout validation helper: `./scripts/task-closeout-check.sh docs/tasks/T-20260302-07-m11-maestro-local-backend-sync-e2e-smoke.md`

## Evidence

- Executed cross-stack command summary.
- `Maestro` artifact root path and key screenshots/logs.
- Manual verification summary: local simulator/backend `E2E` executed because CI is absent.
- Deferred/manual hosted checks summary: hosted sync smoke remains deferred to future cloud work.

## Completion note

- What changed:
- What tests ran:
- What remains:

## Status update checklist

- Update `Status` to `completed`, `blocked`, or `outdated`.
- If `Status = completed` or `outdated`, move the task card to `docs/tasks/complete/` and update affected references in the same session.
- Ensure completion note is filled before handoff.
- If the task changed significant cross-cutting behavior, update `docs/specs/03-technical-architecture.md`, `docs/specs/04-ai-development-playbook.md`, and `docs/specs/06-testing-strategy.md` in the same session as applicable.
- Update `docs/specs/11-maestro-runtime-and-testing-conventions.md` and `docs/specs/09-project-structure.md` in the same session if the shared Maestro/runtime/path contract changes.
- Update parent milestone task breakdown/status in the same session.
