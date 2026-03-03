---
task_id: T-20260302-04
milestone_id: "M11"
status: completed
ui_impact: "no"
areas: "frontend,docs,cross-stack"
runtimes: "node,expo,docs"
gates_fast: "./scripts/quality-fast.sh frontend"
gates_slow: "./scripts/quality-slow.sh frontend"
docs_touched: "docs/specs/03-technical-architecture.md,docs/specs/06-testing-strategy.md,docs/specs/milestones/M11-frontend-backend-sync-integration.md,apps/mobile/src/**"
---

# Task Card

## Task metadata

- Task ID: `T-20260302-04`
- Title: M11 sync engine triggers, retry, and reconciliation
- Status: `completed`
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

- Verified current branch + HEAD commit: `main @ 80290819766127891339256813a0403102f7517e`
- Start-of-session sync completed per `docs/specs/04-ai-development-playbook.md` git sync workflow?: `yes` (`git fetch origin main`; `HEAD...origin/main = 0 0`)
- Parent refs opened in this session:
  - `docs/specs/README.md`
  - `docs/specs/00-product.md`
  - `docs/specs/milestones/M11-frontend-backend-sync-integration.md`
  - `docs/specs/03-technical-architecture.md`
  - `docs/specs/04-ai-development-playbook.md`
  - `docs/specs/06-testing-strategy.md`
  - `docs/specs/09-project-structure.md`
  - `docs/specs/10-api-authn-authz-guidelines.md`
  - `supabase/session-sync-api-contract.md`
  - `/Users/dinohughes/.codex/skills/native-data-fetching/SKILL.md`
  - `docs/specs/11-maestro-runtime-and-testing-conventions.md`
- Code/docs inventory freshness checks run:
  - current sync/auth/session-data modules and route-root wiring
  - app lifecycle hooks, connectivity hooks, and current data-repository entrypoints
  - Maestro runtime script behavior after slow-gate provisioning failure
- Known stale references or assumptions:
  - none
- Optional helper command:
  - `./scripts/task-bootstrap.sh docs/tasks/T-20260302-04-m11-sync-engine-triggers-retry-and-reconciliation.md`

## Objective

Implement the mobile sync engine so authenticated users sync opportunistically during normal foreground app usage, with retries/recovery that never break the app's local-first behavior.

## Scope

### In scope

- Implement sync triggers:
  - bootstrap/app-open
  - app foreground/resume
  - connectivity regain
  - periodic polling while app is open
- Implement retry/backoff and pause reasons.
- Implement reconciliation and conflict-handling behavior for the scoped sync domain.
- Keep the app quiet and usable when sync cannot run.
- Update project-level docs when stable sync behavior becomes implemented reality.

### Out of scope

- End-user auth UI.
- Settings/profile route UI.
- Real OS-level background sync.

## UI Impact (required checkpoint)

- UI Impact?: `no`

## Acceptance criteria

1. Sync runs automatically only when auth/connectivity/backend conditions allow.
2. Sync trigger behavior matches the documented M11 contract.
3. Offline/backend-unavailable/auth-missing states pause sync gracefully without breaking local usage.
4. Conflict-handling/reconciliation behavior matches the documented policy.
5. Tests cover retry/recovery and the implemented reconciliation path.
6. Project-level architecture/testing docs are updated to reflect the implemented stable behavior.

## Docs touched (required)

- Planned docs/spec files to update and why:
  - `docs/specs/milestones/M11-frontend-backend-sync-integration.md` - reflect any refined implementation details
  - `docs/specs/03-technical-architecture.md` - document implemented sync-engine behavior and boundaries
  - `docs/specs/06-testing-strategy.md` - document implemented sync-scenario coverage expectations

## Testing and verification approach

- Planned checks/commands:
  - targeted mobile tests for triggers, retries, and reconciliation
  - `./scripts/quality-fast.sh frontend`
- Standard local gate usage:
  - `./scripts/quality-fast.sh frontend`
  - `./scripts/quality-slow.sh frontend`
- Test layers covered: mobile unit/integration, runtime-sensitive smoke if triggered
- Execution triggers: always
- Slow-gate triggers:
  - required if lifecycle/bootstrap/runtime-sensitive wiring changes touch Maestro-triggering areas from `docs/specs/06-testing-strategy.md`
- Hosted/deployed smoke ownership: `N/A`
- CI/manual posture note: no CI; local frontend gates plus targeted tests are required

## Implementation notes

- Planned files/areas allowed to change:
  - `apps/mobile/src/**`
  - `apps/mobile/app/**`
  - `apps/mobile/app/__tests__/**`
  - `docs/specs/milestones/M11-frontend-backend-sync-integration.md`
  - `docs/specs/03-technical-architecture.md`
  - `docs/specs/06-testing-strategy.md`
- Project structure impact:
  - update `docs/specs/09-project-structure.md` only if a new canonical sync/orchestration path is introduced
- Constraints/assumptions:
  - preserve local-first UX; sync failures must not block recording/edit flows

## Mandatory verify gates

- Standard local fast gate: `./scripts/quality-fast.sh frontend`
- Standard local slow gate: `./scripts/quality-slow.sh frontend` when trigger conditions apply
- Optional closeout validation helper: `./scripts/task-closeout-check.sh docs/tasks/T-20260302-04-m11-sync-engine-triggers-retry-and-reconciliation.md`

## Evidence

- Trigger/retry/reconciliation behavior summary.
- Test coverage summary for graceful degradation and recovery.
- Manual verification summary: local frontend gates executed because CI is absent.

## Completion note

- What changed: Added a foreground sync engine under `apps/mobile/src/sync/**` with a root-mounted `SyncEngineBoundary`, NetInfo-backed connectivity monitoring, app-state/bootstrap/resume/poll triggers, persisted paused/error sync-state transitions, full-snapshot local/remote reconciliation for `gyms` and session graphs, and aggregate stale-write handling that re-reads the remote graph before resolving the winner. Added targeted sync-engine and sync-service tests, updated the app shell to start the engine, installed `@react-native-community/netinfo`, and fixed `apps/mobile/scripts/maestro-ios-dev-client-build.sh` so `--print-app-path` remains machine-readable during required dev-client rebuilds.
- What tests ran: `npm test -- --runInBand app/__tests__/sync-service.test.ts app/__tests__/sync-engine.test.ts`; `npm run typecheck`; `./scripts/quality-fast.sh frontend`; `./scripts/quality-slow.sh frontend`.
- What remains: later M11 tasks still need to add the sync status/settings UI surface, broaden mock-backend scenario coverage, and land the dedicated local-Supabase cross-stack sync proof path.
- Manual verification summary (required when CI is absent/partial): frontend fast and slow gates passed locally. Maestro smoke artifacts: `apps/mobile/artifacts/maestro/ad-hoc/20260303-133418-46159/`. Maestro data-smoke artifacts: `apps/mobile/artifacts/maestro/ad-hoc/20260303-133514-48357/`.

## Status update checklist

- Update `Status` to `completed`, `blocked`, or `outdated`.
- If `Status = completed` or `outdated`, move the task card to `docs/tasks/complete/` and update affected references in the same session.
- Ensure completion note is filled before handoff.
- If the task changed significant cross-cutting behavior, update `docs/specs/03-technical-architecture.md`, `docs/specs/04-ai-development-playbook.md`, and `docs/specs/06-testing-strategy.md` in the same session as applicable.
- Update parent milestone task breakdown/status in the same session.
