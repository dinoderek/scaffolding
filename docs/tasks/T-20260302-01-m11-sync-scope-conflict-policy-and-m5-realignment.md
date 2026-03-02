---
task_id: T-20260302-01
milestone_id: "M11"
status: planned
ui_impact: "no"
areas: "docs,backend,cross-stack"
runtimes: "docs,supabase"
gates_fast: "N/A"
gates_slow: "N/A"
docs_touched: "docs/specs/03-technical-architecture.md,docs/specs/04-ai-development-playbook.md,docs/specs/06-testing-strategy.md,docs/specs/milestones/M5-backend-foundation-authz-and-sync-api.md,docs/specs/milestones/M11-frontend-backend-sync-integration.md,docs/tasks/complete/T-20260220-09-m5-backend-deployment-strategy-and-environments.md,supabase/session-sync-api-contract.md"
---

# Task Card

## Task metadata

- Task ID: `T-20260302-01`
- Title: M11 sync scope, conflict policy, and M5 realignment
- Status: `planned`
- Session date: `2026-03-02`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- Product overview: `docs/specs/00-product.md`
- Milestone spec: `docs/specs/milestones/M11-frontend-backend-sync-integration.md`
- Architecture: `docs/specs/03-technical-architecture.md`
- AI development playbook: `docs/specs/04-ai-development-playbook.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`
- Project structure: `docs/specs/09-project-structure.md`
- API/auth guidelines: `docs/specs/10-api-authn-authz-guidelines.md`
- Backend baseline milestone: `docs/specs/milestones/M5-backend-foundation-authz-and-sync-api.md`
- Sync API contract: `supabase/session-sync-api-contract.md`

## Context Freshness (required at session start; update before edits)

- Verified current branch + HEAD commit: `TBD at execution start`
- Start-of-session sync completed per `docs/specs/04-ai-development-playbook.md` git sync workflow?: `TBD`
- Parent refs opened in this session:
  - `docs/specs/milestones/M11-frontend-backend-sync-integration.md`
  - `docs/specs/milestones/M5-backend-foundation-authz-and-sync-api.md`
  - `docs/specs/03-technical-architecture.md`
  - `docs/specs/04-ai-development-playbook.md`
  - `docs/specs/06-testing-strategy.md`
  - `docs/specs/10-api-authn-authz-guidelines.md`
  - `supabase/session-sync-api-contract.md`
- Code/docs inventory freshness checks run:
  - backend contract audit against current mobile session-edit behavior
  - active milestone/task inventory for M5/M11 planning
- Known stale references or assumptions:
  - assumes M11 remains scoped to the M5 session domain unless this task explicitly broadens it
- Optional helper command:
  - `./scripts/task-bootstrap.sh docs/tasks/T-20260302-01-m11-sync-scope-conflict-policy-and-m5-realignment.md`

## Objective

Lock the M11 sync/auth behavior and conflict-policy contract, audit the current backend contract for known parity gaps, and complete the M5 documentation realignment so cloud deployment no longer blocks the sync milestone.

## Scope

### In scope

- Finalize the written M11 contract for:
  - auth-gated sync behavior
  - sync trigger model
  - conflict policy or conflict-avoidance model
  - session-domain-only scope boundaries
- Audit `supabase/session-sync-api-contract.md` against current frontend edit behavior and record required backend parity work.
- Mark `T-20260220-09` outdated and update M5 milestone status/task references accordingly.
- Promote stable planning decisions into project-level docs (`03`, `04`, `06`) rather than leaving them only in milestone/task docs.

### Out of scope

- Backend schema/API implementation.
- Mobile sync-engine implementation.
- UI route implementation.

## UI Impact (required checkpoint)

- UI Impact?: `no`

## Acceptance criteria

1. M11 scope, auth behavior, and initial sync trigger model are explicitly documented.
2. Conflict policy or conflict-avoidance behavior is explicitly documented strongly enough to guide implementation tasks.
3. Required backend parity gaps are identified and captured for the next task.
4. `T-20260220-09` is marked `outdated` and no longer blocks M5 closeout.
5. Project-level docs (`03`, `04`, `06`) are updated where the stable sync/auth/testing contract has changed.

## Docs touched (required)

- Planned docs/spec files to update and why:
  - `docs/specs/milestones/M11-frontend-backend-sync-integration.md` - lock milestone contract and task breakdown
  - `docs/specs/milestones/M5-backend-foundation-authz-and-sync-api.md` - realign M5 scope/closeout after deferring cloud deployment
  - `docs/tasks/complete/T-20260220-09-m5-backend-deployment-strategy-and-environments.md` - mark outdated with rationale
  - `docs/specs/03-technical-architecture.md` - record planned sync behavior at project level
  - `docs/specs/04-ai-development-playbook.md` - require project-level doc maintenance for significant sync changes
  - `docs/specs/06-testing-strategy.md` - record sync-coverage expectations
  - `supabase/session-sync-api-contract.md` - add audit notes only if the contract summary needs explicit gap callouts

## Testing and verification approach

- Planned checks/commands:
  - docs coherence review across `M5`, `M11`, `03`, `04`, `06`, and sync contract docs
  - `rg` checks for stale M5 `in_progress` / task-reference drift
- Standard local gate usage:
  - `./scripts/quality-fast.sh`: `N/A (docs/planning task)`
  - `./scripts/quality-slow.sh <frontend|backend>`: `N/A`
- Test layers covered: docs/planning coherence
- Execution triggers: always
- Slow-gate triggers: `N/A`
- Hosted/deployed smoke ownership: deferred to a future cloud-environment milestone
- CI/manual posture note: no CI; manual doc coherence review in-task

## Implementation notes

- Planned files/areas allowed to change:
  - `docs/specs/milestones/M11-frontend-backend-sync-integration.md`
  - `docs/specs/milestones/M5-backend-foundation-authz-and-sync-api.md`
  - `docs/tasks/complete/T-20260220-09-m5-backend-deployment-strategy-and-environments.md`
  - `docs/specs/03-technical-architecture.md`
  - `docs/specs/04-ai-development-playbook.md`
  - `docs/specs/06-testing-strategy.md`
  - `supabase/session-sync-api-contract.md` (only if gap callouts are added)
- Project structure impact: `no structure change expected`
- Constraints/assumptions:
  - keep M11 scoped to the existing backend session domain unless a human explicitly broadens it

## Mandatory verify gates

- Standard local fast gate: `N/A (docs/planning task)`
- Standard local slow gate: `N/A`
- Optional closeout validation helper: `./scripts/task-closeout-check.sh docs/tasks/T-20260302-01-m11-sync-scope-conflict-policy-and-m5-realignment.md`

## Evidence

- M11 sync/auth/conflict policy summary.
- M5 scope realignment summary.
- Backend parity gap summary for follow-up implementation.
- Manual verification summary: docs/task reference coherence reviewed because CI is absent for docs-only work.

## Completion note

- What changed:
- What tests ran:
- What remains:

## Status update checklist

- Update `Status` to `completed`, `blocked`, or `outdated`.
- If `Status = completed` or `outdated`, move the task card to `docs/tasks/complete/` and update affected references in the same session.
- Ensure completion note is filled before handoff.
- If the task changed significant cross-cutting behavior, update `docs/specs/03-technical-architecture.md`, `docs/specs/04-ai-development-playbook.md`, and `docs/specs/06-testing-strategy.md` in the same session.
- Update parent milestone task breakdown/status in the same session.
