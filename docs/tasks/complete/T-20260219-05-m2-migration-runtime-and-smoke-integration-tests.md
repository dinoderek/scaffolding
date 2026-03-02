# Task Card

## Task metadata

- Task ID: `T-20260219-05`
- Title: M2 runtime migrations and smoke persistence integration tests
- Status: `completed`
- Owner: `AI + human reviewer`
- Session date: `2026-02-19`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- MVP deliverables: `docs/specs/00-mvp-deliverables.md#1-fe-scaffolding-and-session-tracking`
- Milestone spec: `docs/specs/milestones/M2-local-storage-infrastructure-smoke.md`
- Architecture (if relevant): `docs/specs/03-technical-architecture.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`

## Objective

Execute migrations through runtime bootstrap, add a minimal smoke write/read path, and verify end-to-end local persistence behavior with integration tests.

## Scope

### In scope

- Implement app data bootstrap that runs pending local migrations at runtime.
- Add a tiny smoke persistence function set (insert and read/list for smoke records).
- Add integration tests that validate:
  - fresh DB migration bootstrap
  - smoke insert success
  - smoke read after write
- Execute and capture native runtime smoke evidence (Expo runtime with real SQLite) for migration + smoke read/write.
- Ensure test harness can execute data-layer checks reliably in local environment.
- Update `docs/specs/06-testing-strategy.md` with the two-lane local data verification policy established in M2.

### Out of scope

- Domain entities (`session`, `exercise`, `set`) and business validation.
- Sync/outbox/auth/backend behaviors.
- UI flows or feature-level form interactions.

## Acceptance criteria

1. Runtime bootstrap applies migrations on a fresh local DB without manual intervention.
2. Smoke persistence path can insert and read records successfully after migration.
3. Integration tests cover migration bootstrap and at least one successful write/read scenario.
4. Lane 2 native runtime smoke evidence is captured for migration + smoke insert/read on Expo runtime.
5. `docs/specs/06-testing-strategy.md` is updated with the two-lane data-layer validation guidance.
6. `npm run lint`, `npm run typecheck`, and `npm run test` pass in `apps/mobile`.

## Testing and verification approach (follow `docs/specs/04-ai-development-playbook.md`)

- Planned checks/commands:
  - `npm run test -- <data-layer smoke integration test target>`
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
- Notes:
  - Add at least one failure/edge assertion for migration bootstrap behavior (for example, duplicate bootstrap idempotency).
  - Capture a concise native runtime smoke record (command/steps + observed success signal) as task evidence.

## Implementation notes

- Planned files/areas allowed to change: `apps/mobile/src/data/**`, `apps/mobile/app/**` (bootstrap hook only if needed), `apps/mobile/app/__tests__/**`, `apps/mobile/jest.*`
- Constraints/assumptions:
  - Keep persistence API intentionally small and infrastructure-oriented.
  - Avoid introducing domain contracts beyond smoke-table access.
  - Prefer deterministic test setup/teardown for DB state.

## Mandatory verify gates

- `npm run lint` (from `apps/mobile`)
- `npm run typecheck` (from `apps/mobile`)
- `npm run test` (from `apps/mobile`)

## Evidence (follow `docs/specs/04-ai-development-playbook.md`)

- Lane 1 command outputs summary (`lint`, `typecheck`, `test`, targeted integration test).
- Lane 2 native runtime smoke summary (environment, steps run, migration success signal, smoke write/read success signal).
- Testing strategy update summary for `docs/specs/06-testing-strategy.md`.

## Completion note (fill at end per `docs/specs/04-ai-development-playbook.md`)

- What changed:
  - Implemented runtime migration execution in `apps/mobile/src/data/bootstrap.ts` using `drizzle-orm/expo-sqlite/migrator` with idempotent in-process bootstrap semantics and retry-on-failure behavior.
  - Added migration runtime config in `apps/mobile/src/data/migrations/index.ts` mapped to current generated smoke migration.
  - Added minimal smoke persistence API in `apps/mobile/src/data/smoke-records.ts` (`insertSmokeRecord`, `listSmokeRecords`) and exported it via `apps/mobile/src/data/index.ts`.
  - Updated app bootstrap call in `apps/mobile/app/_layout.tsx` to handle async data-layer bootstrap (`void bootstrapLocalDataLayer()`).
  - Added Lane 1 integration-style data tests:
    - `apps/mobile/app/__tests__/local-data-bootstrap.test.ts`
    - `apps/mobile/app/__tests__/smoke-records.test.ts`
  - Updated `docs/specs/06-testing-strategy.md` with explicit two-lane local data verification policy.
  - Added minimal iOS-native runtime smoke trigger path:
    - `apps/mobile/src/data/runtime-smoke.ts` (`runLocalDataRuntimeSmoke`)
    - `apps/mobile/app/index.tsx` runtime smoke trigger/status surface with stable `testID`s for simulator automation
    - `apps/mobile/.maestro/flows/data-runtime-smoke.yaml`
    - `apps/mobile/scripts/maestro-ios-data-smoke.sh`
    - `apps/mobile/package.json` script: `test:e2e:ios:data-smoke`
  - Hardened iOS Maestro runners against Expo port conflicts by using configurable non-interactive port and explicit simulator deep-link launch:
    - `apps/mobile/scripts/maestro-ios-smoke.sh`
    - `apps/mobile/scripts/maestro-ios-data-smoke.sh`
- Tests run and outcome:
  - `npm run test -- local-data-bootstrap.test.ts smoke-records.test.ts` -> pass (`2` suites, `5` tests).
  - `npm run lint` -> pass.
  - `npm run typecheck` -> pass.
  - `npm run test` -> pass (`4` suites, `11` tests).
  - `npm run db:generate:canary` -> pass (`No schema changes, nothing to migrate`).
  - `TASK_ID=T-20260220-DB-SMOKE npm run test:e2e:ios:data-smoke` -> pass (`1/1` flow passed).
  - `TASK_ID=T-20260220-DB-SMOKE npm run test:e2e:ios:smoke` -> pass (`1/1` flow passed) after shared runner hardening.
  - `npm run lint` -> pass (post-runner updates).
  - `npm run typecheck` -> pass (post-runner updates).
  - `npm run test` -> pass (`5` suites, `13` tests; includes `runtime-smoke.test.ts`).
- Lane 2 native runtime smoke evidence:
  - Environment: iOS simulator (`xcrun simctl` available devices).
  - Flow: `apps/mobile/.maestro/flows/data-runtime-smoke.yaml`.
  - Success artifact root:
    - `apps/mobile/artifacts/maestro/T-20260220-DB-SMOKE/20260220-112955/`
  - Required screenshots captured:
    - `apps/mobile/artifacts/maestro/T-20260220-DB-SMOKE/20260220-112955/maestro-output/screenshots/03-data-runtime-smoke-start.png`
    - `apps/mobile/artifacts/maestro/T-20260220-DB-SMOKE/20260220-112955/maestro-output/screenshots/04-data-runtime-smoke-success.png`
