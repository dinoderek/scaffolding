# Testing Strategy (High-Level)

## Purpose

Define the top-level testing stack and working practices for MVP.

## Decisions and rationale

1. `Vitest` for unit/domain tests.
Reason: fast feedback loop for logic-heavy parts like set/session calculations and sync state behavior.

2. `React Native Testing Library + jest-expo` for UI/component tests.
Reason: validates real screen behavior with React Native-friendly tooling.

3. `Data layer integration tests` against local SQLite schema.
Reason: catches migration and persistence issues early in an offline-first app.

4. `Two-lane local data verification` for SQLite runtime confidence.
Reason: keep CI feedback fast with deterministic checks while still proving real-device migration and persistence behavior in native Expo runtime.

5. `Backend auth/RLS contract tests`.
Reason: prevents data-leak/security regressions as backend is introduced.

6. `Maestro` for MVP end-to-end flows.
Reason: practical mobile E2E coverage with lower setup cost than heavier alternatives.

7. `Quality gate in CI` (core tests must pass before merge).
Reason: keeps AI-generated changes safe and predictable as code volume grows.

## Local data two-lane policy (M2)

- Lane 1 (`CI-safe`):
  - Run fast checks in `apps/mobile` (`lint`, `typecheck`, `test`) and include targeted data-layer tests that validate migration/bootstrap orchestration and smoke insert/read behavior using deterministic test doubles.
  - Include migration-generation canary (`npm run db:generate:canary`) to detect schema/migration artifact drift.
- Lane 2 (`native runtime smoke`):
  - Run a focused smoke flow on Expo native runtime with real `expo-sqlite`.
  - Capture concise evidence: runtime environment, steps executed, migration success signal, and smoke write/read success signal.
- Rule:
  - Do not treat Lane 1 as a substitute for Lane 2 when validating runtime SQLite behavior; both lanes are required for milestone-level local data confidence.

## Default testing practice

- Every feature should include at least one success-path test and one offline/error-path test.
- During execution sessions, run a targeted test or gate after each meaningful change, then run full `lint + typecheck + test` before task closeout.

## iOS UI smoke policy (Maestro, current stage)

- Jest/React Native Testing Library remains the default for component logic, state transitions, and CI-safe assertions.
- Maestro is used for simulator/device-integrated UI smoke checks that confirm core screens are reachable and visibly intact.
- Current required Maestro coverage is a single iOS smoke flow:
  - app launch visible state
  - session recorder visible state
- Required screenshots for smoke flow:
  - `01-app-launch`
  - `02-session-recorder-visible`
- Screenshot capture is automated by the Maestro flow and stored under:
  - `apps/mobile/artifacts/maestro/<task-id-or-ad-hoc>/<timestamp>/`
- Rule:
  - if a task changes user-facing UI, run `npm run test:e2e:ios:smoke` before closeout.

## iOS simulator data smoke policy (Maestro, current stage)

- Purpose:
  - validate runtime migration + smoke insert/read behavior on real Expo iOS runtime (`expo-sqlite`) when change risk is runtime-sensitive.
- Command:
  - `npm run test:e2e:ios:data-smoke`
- Required when any of these are true:
  - `apps/mobile/src/data/bootstrap.ts` changes.
  - `apps/mobile/src/data/migrations/**` changes.
  - `apps/mobile/drizzle/**` migration artifacts or schema outputs change.
  - `apps/mobile/package.json` changes include Expo/SQLite/Drizzle dependency updates.
  - milestone/release closeout requires fresh native runtime data evidence.
- Optional (recommended) when:
  - data-layer behavior changes are low risk and local runtime confidence is desired before handoff.
- Usually not required when:
  - changes are limited to data-repository pure logic that does not alter runtime migration/bootstrap wiring and Lane 1 checks are green.
- Evidence expectations:
  - include command result and screenshot paths from `apps/mobile/artifacts/maestro/<task-id-or-ad-hoc>/<timestamp>/`.
  - required screenshots for data smoke flow:
    - `03-data-runtime-smoke-start`
    - `04-data-runtime-smoke-success`

## iOS simulator parallel-run policy (Maestro)

- Problem:
  - parallel local agents can collide on simulator selection and Expo dev-server ports.
- Enforcement:
  - iOS Maestro runner scripts must acquire a shared host lock slot before booting simulator / starting Expo.
  - slot lock root defaults to `/tmp/scaffolding2-maestro-ios-slots`.
  - default slots are `slot-1,slot-2,slot-3` and each slot gets a deterministic Expo port (`base + slot-index`).
- Configuration:
  - `MAESTRO_IOS_SLOT_IDS` (default: `slot-1,slot-2,slot-3`)
  - `MAESTRO_IOS_SLOT_WAIT_SECONDS` (default: `120`)
  - `MAESTRO_IOS_SLOT_POLL_SECONDS` (default: `1`)
  - `MAESTRO_IOS_SLOT_LOCK_ROOT` (default: `/tmp/scaffolding2-maestro-ios-slots`)
  - `EXPO_DEV_SERVER_BASE_PORT` (default: `8082`)
  - optional per-slot simulator pools:
    - `IOS_SIM_DEVICE_POOL` (comma-separated device names)
    - `IOS_SIM_UDID_POOL` (comma-separated UDIDs; preferred when deterministic mapping is required)
- Operational rules:
  - parallel runs are supported up to configured slot count.
  - if no slot is free before timeout, runner exits non-zero.
  - manual overrides (`EXPO_DEV_SERVER_PORT`, `IOS_SIM_DEVICE`, `IOS_SIM_UDID`) are allowed but can bypass isolation; use with care in shared-host parallel runs.

## Planned next phase (UI quality and appearance)

1. Add visual regression testing for critical screens/components.
Reason: catch layout and styling regressions (spacing, clipping, overlap) that behavior tests miss.

2. Define a lightweight UI contract per key screen (visibility, tap targets, no overlap, small-phone fit).
Reason: make visual correctness explicit so both humans and AI can validate against clear rules.

3. Add screenshot checkpoints in end-to-end flows.
Reason: verify real user journeys preserve expected appearance.

4. Establish baseline update policy for snapshots.
Reason: ensure visual changes are intentional and reviewed, not silently accepted.

5. Use visual diff output as AI iteration input.
Reason: helps AI make targeted UI fixes and faster design refinements.
