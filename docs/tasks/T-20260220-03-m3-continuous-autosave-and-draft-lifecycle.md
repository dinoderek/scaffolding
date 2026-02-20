# Task Card

## Task metadata

- Task ID: `T-20260220-03`
- Title: M3 continuous autosave and draft lifecycle persistence
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

Implement local continuous persistence for the session recorder so user edits are durably saved in draft form under a bounded autosave SLA.

## Scope

### In scope

- Create draft session record at first meaningful recorder interaction.
- Persist recorder mutations through repository/data-layer APIs.
- Implement autosave SLA:
  - Text edits: debounced write at `3s`.
  - Structural edits (add/remove/reorder/select): immediate transaction.
  - Immediate flush on screen blur, route change, and app background transition.
  - Dirty-state max flush interval of `10s` while staying on-screen.
- Restore draft state when returning to recorder.
- Add tests for autosave timing and lifecycle flush behavior.

### Out of scope

- Session completion semantics (`completedAt`, `durationSec`) beyond retaining draft state.
- Sync/outbox/backend propagation.
- Group adoption UI.

## Acceptance criteria

1. Recorder state changes are persisted according to autosave policy without requiring explicit submit.
2. Debounced text writes occur at `3s` cadence and do not write on every keystroke.
3. Structural actions write immediately in a transaction-safe manner.
4. Blur/route/background transitions flush dirty state immediately.
5. Dirty state is never older than `10s` during sustained editing.
6. Closing and reopening recorder restores last persisted draft state.
7. `npm run lint`, `npm run typecheck`, and `npm run test` pass in `apps/mobile`.

## Testing and verification approach (follow `docs/specs/04-ai-development-playbook.md`)

- Planned checks/commands:
  - targeted autosave timing/lifecycle tests (fake timers + lifecycle event mocks)
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
- Notes:
  - Include at least one edge case proving no data loss when blur/background occurs before debounce timer fires.

## Implementation notes

- Planned files/areas allowed to change:
  - `apps/mobile/app/session-recorder.tsx`
  - `apps/mobile/src/data/**`
  - `apps/mobile/components/session-recorder/**`
  - `apps/mobile/app/__tests__/**`
- Constraints/assumptions:
  - Persist input-compatible values (including partially typed numeric fields) without premature parse failures.
  - Keep the autosave scheduler implementation explicit and testable.

## Mandatory verify gates

- `npm run lint` (from `apps/mobile`)
- `npm run typecheck` (from `apps/mobile`)
- `npm run test` (from `apps/mobile`)

## Evidence (follow `docs/specs/04-ai-development-playbook.md`)

- Lane 1 command output summary.
- Autosave behavior evidence summary (timing assertions + lifecycle flush assertions).

## Completion note (fill at end per `docs/specs/04-ai-development-playbook.md`)

- 
