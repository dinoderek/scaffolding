# Task Card

## Task metadata

- Task ID: `T-20260220-04`
- Title: M3 session completion duration persistence and architecture decision update
- Status: `planned`
- Owner: `AI + human reviewer`
- Session date: `2026-02-20`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- MVP deliverables: `docs/specs/00-mvp-deliverables.md#1-fe-scaffolding-and-session-tracking`
- Milestone spec: `docs/specs/milestones/M3-session-domain-local-autosave.md`
- Architecture (if relevant): `docs/specs/03-technical-architecture.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`

## Objective

Finalize session completion persistence (`completedAt`, materialized `durationSec`) and codify milestone architecture decisions in the top-level architecture spec, without wiring to the existing UI yet.

## Scope

### In scope

- Implement session completion transition (`draft/active -> completed`).
- Materialize and persist `durationSec` at completion time from `startedAt` and `completedAt`.
- Ensure completed sessions are queryable/sortable by persisted duration and completion timestamp.
- Add tests for duration calculation and completion-state transition correctness.
- Add completion command/helper contracts that are ready for later React Native UI event wiring (but keep this task UI-decoupled).
- Update `docs/specs/03-technical-architecture.md` to include:
  - continuous local autosave SLA decisions
  - duration materialization strategy
  - provenance-forward modeling for future server/group gym/exercise adoption

### Out of scope

- Cloud sync of completed sessions.
- Group/social leaderboard analytics.
- Detailed reporting UI.
- Any direct wiring into `apps/mobile/app/session-recorder.tsx` or existing recorder UI components.

## Acceptance criteria

1. Session completion persists `completedAt` and `durationSec` using deterministic calculation.
2. Completion is idempotent-safe (no duplicate/invalid completion writes).
3. Read/query path can sort/filter by `durationSec` and completion timestamps for analysis use cases.
4. Duration calculation tests cover standard and edge conditions (short sessions, null/missing timing guards).
5. Completion helper contracts are exposed for future UI hookup without requiring current screen changes.
6. `docs/specs/03-technical-architecture.md` is updated with M3 decisions and rationale.
7. `npm run lint`, `npm run typecheck`, and `npm run test` pass in `apps/mobile`.

## Testing and verification approach (follow `docs/specs/04-ai-development-playbook.md`)

- Planned checks/commands:
  - targeted standalone completion/duration tests (repository/domain level, no screen mount required)
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
- Notes:
  - If migration artifacts change in this task, include `npm run db:generate:canary` and run Lane 2 native data smoke per `docs/specs/06-testing-strategy.md`.

## Implementation notes

- Planned files/areas allowed to change:
  - `apps/mobile/src/data/**`
  - `apps/mobile/src/**` (non-UI completion helper modules only)
  - `apps/mobile/app/__tests__/**`
  - `docs/specs/03-technical-architecture.md`
- Constraints/assumptions:
  - Persisted duration is authoritative for analysis/sort queries; UI can still display live derived duration for in-progress sessions.
  - Do not wire or modify existing session-recorder UI behavior in this task.

## Mandatory verify gates

- `npm run lint` (from `apps/mobile`)
- `npm run typecheck` (from `apps/mobile`)
- `npm run test` (from `apps/mobile`)

## Evidence (follow `docs/specs/04-ai-development-playbook.md`)

- Lane 1 command output summary.
- Completion/duration test assertions summary.
- Architecture spec update summary.

## Completion note (fill at end per `docs/specs/04-ai-development-playbook.md`)

- 
