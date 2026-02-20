# Task Card

## Task metadata

- Task ID: `T-20260220-03`
- Title: M3 continuous autosave and draft lifecycle persistence
- Status: `completed`
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

Implement local continuous persistence primitives for session-recorder draft data so edits are durably saved under a bounded autosave SLA, without wiring to the existing UI yet.

## Scope

### In scope

- Create draft session record at first meaningful recorder interaction via domain/data-layer APIs.
- Persist recorder mutations through repository/data-layer APIs.
- Implement autosave SLA:
  - Text edits: debounced write at `3s`.
  - Structural edits (add/remove/reorder/select): immediate transaction.
  - Immediate flush on lifecycle triggers (blur/route/background) through helper adapters.
  - Dirty-state max flush interval of `10s` while staying on-screen.
- Restore draft state when draft load APIs are invoked.
- Add helper adapters/contracts that map React Native lifecycle events into autosave flush signals (no screen hookup yet).
- Add standalone tests for autosave timing and lifecycle flush behavior.

### Out of scope

- Session completion semantics (`completedAt`, `durationSec`) beyond retaining draft state.
- Sync/outbox/backend propagation.
- Group adoption UI.
- Any direct wiring into `apps/mobile/app/session-recorder.tsx` or existing recorder UI components.

## Acceptance criteria

1. Draft state changes are persisted according to autosave policy without requiring explicit submit.
2. Debounced text writes occur at `3s` cadence and do not write on every keystroke.
3. Structural actions write immediately in a transaction-safe manner.
4. Lifecycle trigger helpers (blur/route/background) flush dirty state immediately when invoked.
5. Dirty state is never older than `10s` during sustained editing.
6. Re-loading a draft restores last persisted draft state through data/domain APIs.
7. Helper contracts for React Native lifecycle integration are available for later UI wiring.
8. `npm run lint`, `npm run typecheck`, and `npm run test` pass in `apps/mobile`.

## Testing and verification approach (follow `docs/specs/04-ai-development-playbook.md`)

- Planned checks/commands:
  - targeted standalone autosave timing/lifecycle tests (fake timers + lifecycle event mocks, no screen mount required)
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
- Notes:
  - Include at least one edge case proving no data loss when lifecycle flush happens before debounce timer fires.

## Implementation notes

- Planned files/areas allowed to change:
  - `apps/mobile/src/data/**`
  - `apps/mobile/src/**` (non-UI autosave/lifecycle helper modules only)
  - `apps/mobile/app/__tests__/**`
- Constraints/assumptions:
  - Persist input-compatible values (including partially typed numeric fields) without premature parse failures.
  - Keep the autosave scheduler implementation explicit and testable.
  - Do not wire or modify existing session-recorder UI behavior in this task.

## Mandatory verify gates

- `npm run lint` (from `apps/mobile`)
- `npm run typecheck` (from `apps/mobile`)
- `npm run test` (from `apps/mobile`)

## Evidence (follow `docs/specs/04-ai-development-playbook.md`)

- Lane 1 command output summary.
- Autosave behavior evidence summary (timing assertions + lifecycle flush assertions).

## Completion note (fill at end per `docs/specs/04-ai-development-playbook.md`)

- What changed:
  - Added standalone autosave controller with explicit policy support in `apps/mobile/src/session-recorder/draft-autosave.ts`:
    - text debounce writes (`3s`)
    - immediate structural-change writes
    - dirty-state max interval flush (`10s`)
    - lifecycle-triggered flush support (`screen-blur`, `route-change`, `app-background`)
  - Added non-UI lifecycle helper adapters in `apps/mobile/src/session-recorder/lifecycle-helpers.ts` to map future React Native events to autosave flush triggers.
  - Added domain draft persistence repository primitives in `apps/mobile/src/data/session-drafts.ts` and exports in `apps/mobile/src/data/index.ts`:
    - draft snapshot persistence
    - latest draft restore API
    - non-completed-session guardrails for draft writes
  - Added standalone autosave/lifecycle coverage in `apps/mobile/app/__tests__/draft-autosave-controller.test.ts`.
- What tests ran:
  - `npm run test -- draft-autosave-controller.test.ts session-drafts-repository.test.ts` -> pass.
  - `npm run lint` -> pass.
  - `npm run typecheck` -> pass.
  - `npm run test` -> pass (`10` suites, `34` tests).
- What remains:
  - Wiring these helpers into `apps/mobile/app/session-recorder.tsx` is intentionally deferred and should be handled in a follow-up UI-integration task.
