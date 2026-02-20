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

Finalize session completion persistence (`completedAt`, materialized `durationSec`) and codify milestone architecture decisions in the top-level architecture spec.

## Scope

### In scope

- Implement session completion transition (`draft/active -> completed`).
- Materialize and persist `durationSec` at completion time from `startedAt` and `completedAt`.
- Ensure completed sessions are queryable/sortable by persisted duration and completion timestamp.
- Add tests for duration calculation and completion-state transition correctness.
- Update `docs/specs/03-technical-architecture.md` to include:
  - continuous local autosave SLA decisions
  - duration materialization strategy
  - provenance-forward modeling for future server/group gym/exercise adoption

### Out of scope

- Cloud sync of completed sessions.
- Group/social leaderboard analytics.
- Detailed reporting UI.

## Acceptance criteria

1. Session completion persists `completedAt` and `durationSec` using deterministic calculation.
2. Completion is idempotent-safe (no duplicate/invalid completion writes).
3. Read/query path can sort/filter by `durationSec` and completion timestamps for analysis use cases.
4. Duration calculation tests cover standard and edge conditions (short sessions, null/missing timing guards).
5. `docs/specs/03-technical-architecture.md` is updated with M3 decisions and rationale.
6. `npm run lint`, `npm run typecheck`, and `npm run test` pass in `apps/mobile`.

## Testing and verification approach (follow `docs/specs/04-ai-development-playbook.md`)

- Planned checks/commands:
  - targeted completion/duration tests
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
- Notes:
  - If migration artifacts change in this task, include `npm run db:generate:canary` and run Lane 2 native data smoke per `docs/specs/06-testing-strategy.md`.

## Implementation notes

- Planned files/areas allowed to change:
  - `apps/mobile/src/data/**`
  - `apps/mobile/app/session-recorder.tsx` (completion submit wiring only)
  - `apps/mobile/app/__tests__/**`
  - `docs/specs/03-technical-architecture.md`
- Constraints/assumptions:
  - Persisted duration is authoritative for analysis/sort queries; UI can still display live derived duration for in-progress sessions.

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
