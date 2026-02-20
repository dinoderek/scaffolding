# Milestone Spec

## Milestone metadata

- Milestone ID: `M3`
- Title: Session domain model and continuous local persistence
- Status: `planned`
- Owner: `AI + human reviewer`
- Target window: `2026-02`

## Parent references

- Project directives: `docs/specs/README.md`
- MVP deliverables: `docs/specs/00-mvp-deliverables.md#1-fe-scaffolding-and-session-tracking`
- Architecture: `docs/specs/03-technical-architecture.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`

## Milestone objective

Implement the first production-oriented local workout domain data model (`Gym`, `Session`, `Exercise`, `Set`) on top of the validated Drizzle/SQLite infrastructure, including continuous draft persistence and session completion duration materialization.

## In scope

- Replace smoke-only schema usage with domain schema for session recording.
- Add local data model for:
  - `gyms`
  - `sessions`
  - `session_exercises`
  - `exercise_sets`
- Persist sessions continuously in local DB while user edits the recorder.
- Define and implement autosave policy:
  - Debounced text-edit writes (`3s`).
  - Immediate transactional writes for structural changes.
  - Immediate flush on screen blur, route change, and app background transition.
  - Dirty-state max flush interval (`10s`) while user remains on screen.
- Support draft-to-completed session lifecycle with persisted duration.
- Add forward-compatible provenance fields so gyms/exercises can later be adopted from server/group catalogs without schema redesign.

## Out of scope

- Backend sync/outbox or cloud conflict resolution.
- Group adoption UX flows and server fetch logic.
- Auth/RLS/backend schema implementation.
- Analytics dashboards and advanced reporting.

## Deliverables

1. Domain schema + migration artifacts for core recorder entities.
2. Continuous local autosave + draft lifecycle persistence for session recorder state.
3. Session completion flow that stores `durationSec` for sorting/analysis use cases.
4. Architecture spec update capturing new local persistence and forward-compatibility decisions.

## Acceptance criteria

1. Domain tables exist with enforced relational integrity (`Session -> Exercise -> Set`) and no uniqueness constraint on gym names.
2. Recorder edits persist continuously under the autosave SLA defined in this milestone.
3. A draft session can be resumed after navigation/background transitions without losing committed edits.
4. Completing a session persists `completedAt` and materialized `durationSec`.
5. Forward-compatible provenance fields are present for future server/group-origin gyms and exercises.
6. `docs/specs/03-technical-architecture.md` is updated with the milestone decisions.
7. Required quality gates pass in `apps/mobile`: `npm run lint`, `npm run typecheck`, `npm run test`.

## Task breakdown

1. `docs/tasks/T-20260220-02-m3-domain-schema-and-migrations.md` - define and migrate domain schema, constraints, and provenance-ready columns.
2. `docs/tasks/T-20260220-03-m3-continuous-autosave-and-draft-lifecycle.md` - implement recorder autosave SLA and lifecycle flush semantics.
3. `docs/tasks/T-20260220-04-m3-session-completion-duration-and-architecture-update.md` - complete session finalization/duration persistence and update architecture spec.

## Risks / dependencies

- Autosave cadence must balance write-amplification vs. data-loss window on mobile lifecycle edges.
- Draft persistence can conflict with evolving UI state model unless identity/order semantics are stable.
- Provenance fields introduced now must remain generic enough to fit future group/server adoption models.

## Decision log

- Date: 2026-02-20
- Decision: Adopt continuous local persistence with bounded autosave SLA (`3s` debounce, immediate structural writes, lifecycle flush, `10s` dirty cap).
- Reason: Reduce user-visible data loss risk without excessive write frequency.
- Impact: Enables resilient offline recording with predictable persistence behavior and lower write churn.

- Date: 2026-02-20
- Decision: Keep gym names non-unique and add provenance-ready fields for gyms/exercises.
- Reason: Future group/server adoption needs identity decoupled from user-visible names.
- Impact: Avoids near-term schema churn when shared catalogs are introduced.
