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
