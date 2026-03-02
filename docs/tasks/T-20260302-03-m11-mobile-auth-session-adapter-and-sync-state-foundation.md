---
task_id: T-20260302-03
milestone_id: "M11"
status: planned
ui_impact: "no"
areas: "frontend,docs"
runtimes: "node,expo,docs"
gates_fast: "./scripts/quality-fast.sh frontend"
gates_slow: "N/A"
docs_touched: "docs/specs/03-technical-architecture.md,docs/specs/06-testing-strategy.md,docs/specs/milestones/M11-frontend-backend-sync-integration.md,apps/mobile/src/**"
---

# Task Card

## Task metadata

- Task ID: `T-20260302-03`
- Title: M11 mobile auth session adapter and sync-state foundation
- Status: `planned`
- Session date: `2026-03-02`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- Milestone spec: `docs/specs/milestones/M11-frontend-backend-sync-integration.md`
- Architecture: `docs/specs/03-technical-architecture.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`
- Project structure: `docs/specs/09-project-structure.md`
- API/auth guidelines: `docs/specs/10-api-authn-authz-guidelines.md`
- Sync API contract: `supabase/session-sync-api-contract.md`
- Skill reference: `/Users/dinohughes/.codex/skills/native-data-fetching/SKILL.md`

## Context Freshness (required at session start; update before edits)

- Verified current branch + HEAD commit: `TBD at execution start`
- Start-of-session sync completed per `docs/specs/04-ai-development-playbook.md` git sync workflow?: `TBD`
- Parent refs opened in this session:
  - `docs/specs/milestones/M11-frontend-backend-sync-integration.md`
  - `docs/specs/03-technical-architecture.md`
  - `docs/specs/06-testing-strategy.md`
  - `docs/specs/10-api-authn-authz-guidelines.md`
  - `supabase/session-sync-api-contract.md`
  - `/Users/dinohughes/.codex/skills/native-data-fetching/SKILL.md`
- Code/docs inventory freshness checks run:
  - mobile data/bootstrap/schema inventory
  - existing app-root/provider inventory
- Known stale references or assumptions:
  - assumes no end-user login UI is introduced in this task
- Optional helper command:
  - `./scripts/task-bootstrap.sh docs/tasks/T-20260302-03-m11-mobile-auth-session-adapter-and-sync-state-foundation.md`

## Objective

Add the mobile-side foundation required for sync to consume authenticated sessions safely and to persist local sync metadata without introducing login UI.

## Scope

### In scope

- Add a mobile auth/session abstraction for sync consumption.
- Add backend-client plumbing that attaches user auth state when present.
- Add local persistence for sync metadata/status.
- Add tests for logged-out vs authenticated sync eligibility and persisted sync-state behavior.
- Update project-level docs if architecture/testing expectations become stable.

### Out of scope

- End-user sign-in screens or auth UX.
- Full sync orchestration/reconciliation logic.
- Settings/profile sync status route.

## UI Impact (required checkpoint)

- UI Impact?: `no`

## Acceptance criteria

1. Mobile code has a clear auth/session adapter interface for sync consumption.
2. Backend client wiring uses authenticated session state when available and remains safe when absent.
3. Local sync metadata/state is persisted in the mobile data layer.
4. Tests prove sync remains disabled when no authenticated session is present.
5. Project-level architecture/testing docs are updated if new stable sync-state behavior is introduced.

## Docs touched (required)

- Planned docs/spec files to update and why:
  - `docs/specs/milestones/M11-frontend-backend-sync-integration.md` - record any refined implementation detail
  - `docs/specs/03-technical-architecture.md` - document stable auth-aware sync-client behavior if introduced
  - `docs/specs/06-testing-strategy.md` - document sync-state/auth-gating coverage if refined

## Testing and verification approach

- Planned checks/commands:
  - targeted mobile unit/integration tests for auth adapter and sync state
  - `./scripts/quality-fast.sh frontend`
- Standard local gate usage:
  - `./scripts/quality-fast.sh frontend`
  - `./scripts/quality-slow.sh frontend`: `N/A unless runtime-sensitive bootstrap/migration changes trigger it`
- Test layers covered: mobile unit/integration
- Execution triggers: always
- Slow-gate triggers:
  - run `./scripts/quality-slow.sh frontend` if this task changes mobile bootstrap/migrations, `app/maestro-harness.tsx`, or other runtime-sensitive data-layer wiring
- Hosted/deployed smoke ownership: `N/A`
- CI/manual posture note: no CI; local frontend fast gates are required

## Implementation notes

- Planned files/areas allowed to change:
  - `apps/mobile/src/**`
  - `apps/mobile/app/__tests__/**`
  - `apps/mobile/drizzle/**` and `apps/mobile/src/data/migrations/**` if sync-state persistence needs schema changes
  - `docs/specs/milestones/M11-frontend-backend-sync-integration.md`
  - `docs/specs/03-technical-architecture.md`
  - `docs/specs/06-testing-strategy.md`
- Project structure impact:
  - likely no new top-level path; update `docs/specs/09-project-structure.md` only if a new canonical sync-specific path is introduced
- Constraints/assumptions:
  - prefer `fetch`-based client wiring; no `service_role` or privileged secrets in mobile code

## Mandatory verify gates

- Standard local fast gate: `./scripts/quality-fast.sh frontend`
- Standard local slow gate: `./scripts/quality-slow.sh frontend` when runtime-sensitive trigger conditions apply
- Optional closeout validation helper: `./scripts/task-closeout-check.sh docs/tasks/T-20260302-03-m11-mobile-auth-session-adapter-and-sync-state-foundation.md`

## Evidence

- Auth-session adapter summary.
- Persisted sync-state summary.
- Manual verification summary: local frontend fast gates executed because CI is absent.

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
