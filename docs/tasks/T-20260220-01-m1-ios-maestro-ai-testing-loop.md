# Task Card

## Task metadata

- Task ID: `T-20260220-01`
- Title: M1 iOS Maestro AI testing loop setup and documentation
- Status: `planned`
- Owner: `AI + human reviewer`
- Session date: `2026-02-20`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- MVP deliverables: `docs/specs/00-mvp-deliverables.md#1-fe-scaffolding-and-session-tracking`
- Milestone spec: `docs/specs/milestones/M1-ui-session-recorder.md`
- Architecture (if relevant): `docs/specs/03-technical-architecture.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`
- UX standard (UI/UX tasks only; remove for non-UX tasks): `docs/specs/08-ux-delivery-standard.md`

## Objective

Establish an iOS-only AI-executable UI testing loop for the session recorder using Maestro flows, deterministic simulator orchestration, screenshot artifacts, and clear human/AI runbook documentation.

## Scope

### In scope

- Add a single minimal Maestro iOS flow under `apps/mobile/.maestro/flows/` for app launch + session recorder visibility smoke verification.
- Add iOS simulator + Maestro runner scripts under `apps/mobile/scripts/`.
- Add npm scripts in `apps/mobile/package.json` for repeatable iOS smoke execution.
- Add or align stable automation selectors (`testID`/accessible labels) only where needed to make flows deterministic.
- Document AI iOS testing workflow and artifact expectations in:
  - `apps/mobile/README.md` (high-level entrypoint)
  - `apps/mobile/README-maestro.md` (detailed runbook)
- Update top-level testing strategy to record Maestro policy decisions for this stage (when to use Maestro vs Jest, required screenshots, and UI-change execution rule).

### Out of scope

- Android (`adb`/Android emulator) test setup.
- Detox/Playwright/Appium adoption.
- New product features beyond selector or UX-copy adjustments required to stabilize automation.
- Cloud-hosted device-farm execution.
- Any non-smoke Maestro coverage (happy-path submit and validation/correction flows).

## UX Contract (UI/UX tasks only; remove this entire section for non-UX tasks)

### Key user flows (minimal template)

1. Flow name: Smoke launch and entry to session recorder
   - Trigger: Tester/AI starts app from cold state on iOS simulator.
   - Steps: Launch app -> confirm home/root renders -> navigate to session recorder -> confirm recorder shell is visible.
   - Success outcome: Session recorder screen is reachable with no crash and primary controls visible.
   - Failure/edge outcome: App does not launch, route is unreachable, or expected controls are missing.

### Interaction + appearance notes (lightweight; prefer <= 5 bullets)

- Critical controls used in flows should remain visible without horizontal scrolling on phone layouts.
- Smoke checkpoint screenshot must clearly show the session recorder screen.

## Acceptance criteria

1. A single iOS Maestro smoke flow exists for launch + session recorder visibility.
2. A deterministic runner can boot an iOS simulator, execute smoke flow, and emit artifacts to a task-aware output directory.
3. `apps/mobile/package.json` includes documented scripts for iOS smoke execution.
4. `apps/mobile/README.md` and `apps/mobile/README-maestro.md` describe AI iOS smoke loop commands, prerequisites, and troubleshooting.
5. `docs/specs/06-testing-strategy.md` is updated with explicit Maestro policy:
   - when to use Maestro vs Jest
   - what Maestro should test at this stage
   - what screenshots must be captured
   - screenshot automation/storage approach
   - rule: if UI is touched, run Maestro smoke before closeout
6. At least one smoke run is executed successfully in-session with screenshot and command evidence.

## Testing and verification approach (follow `docs/specs/04-ai-development-playbook.md` and `docs/specs/08-ux-delivery-standard.md` for UI tasks)

- Planned checks/commands:
  - `npm run lint` (from `apps/mobile`)
  - `npm run typecheck` (from `apps/mobile`)
  - `npm run test` (from `apps/mobile`)
  - `npm run test:e2e:ios:smoke` (new; Maestro smoke flow)
- Notes:
  - The smoke flow must be executable without manual tap intervention once simulator boot script runs.
  - Flow must fail fast on missing controls/text to make regressions obvious.
  - Selectors should be resilient to non-functional UI changes (prefer explicit `testID` where possible).

### Testing content specification (required)

1. Flow: `smoke-launch`
   - Intent: detect app boot and session-recorder-route regressions quickly.
   - Assertions:
     - app launches to expected root UI.
     - session recorder route is reachable.
   - Screenshots:
     - initial app render
     - session recorder initial state

## Implementation notes

- Planned files/areas allowed to change:
  - `apps/mobile/.maestro/**`
  - `apps/mobile/scripts/**`
  - `apps/mobile/package.json`
  - `apps/mobile/app/**` (only minimal selector/text stabilization)
  - `apps/mobile/components/**` (only minimal selector/text stabilization)
  - `apps/mobile/README.md`
  - `apps/mobile/README-maestro.md` (new)
  - `docs/specs/06-testing-strategy.md`
  - `docs/tasks/T-20260220-01-m1-ios-maestro-ai-testing-loop.md`
- Constraints/assumptions:
  - iOS-only coverage is acceptable for this task phase.
  - Host tools (`maestro`, `eas`, `xcrun simctl`) are available.
  - Keep setup lightweight; avoid introducing additional E2E frameworks.

## Policy decisions recorded by this task

These decisions are temporary during execution and must be codified in `docs/specs/06-testing-strategy.md` before task closeout.

1. Maestro vs Jest usage policy:
   - Use Jest/React Native Testing Library for component logic, state transitions, and fast CI-safe behavioral assertions.
   - Use Maestro for on-device/simulator integration smoke of critical UI navigation and render visibility.
2. Maestro coverage policy for this stage:
   - Maestro covers only one check in this task: app launches and session recorder screen is visible.
   - Submit-flow and validation-flow Maestro tests are deferred to a follow-up task.
3. Screenshot policy:
   - Capture exactly two screenshots in smoke flow:
     - `01-app-launch`
     - `02-session-recorder-visible`
4. Screenshot automation policy:
   - Screenshots are captured automatically by the Maestro smoke flow and stored in artifacts directory.
   - No automated visual diffing is introduced in this task.
5. UI-change execution policy:
   - If a task changes user-facing UI, `npm run test:e2e:ios:smoke` must run before task closeout.
6. Platform scope decision:
   - Android automation is explicitly deferred for now; iOS-only Maestro setup is intentional.

## Decision log

- Date: 2026-02-20
- Decision: Defer Android Maestro setup and ship iOS-only smoke coverage first.
- Reason: Minimize setup complexity and validate the workflow with one platform before expanding scope.
- Impact: Faster adoption path now; Android can be added in a follow-up task once iOS loop is stable.

## Mandatory verify gates

- `npm run lint` (from `apps/mobile`)
- `npm run typecheck` (from `apps/mobile`)
- `npm run test` (from `apps/mobile`)
- `npm run test:e2e:ios:smoke` (from `apps/mobile`)

## Evidence (follow `docs/specs/04-ai-development-playbook.md` and `docs/specs/08-ux-delivery-standard.md` for UI tasks)

- Command evidence:
  - output for lint/typecheck/unit tests
  - output for Maestro smoke run
- Visual evidence:
  - screenshot artifacts under `apps/mobile/artifacts/maestro/<task-id-or-ad-hoc>/<timestamp>/`
  - at minimum one screenshot for each defined checkpoint in testing content specification
- Contract traceability:
  - brief mapping from each UX contract flow to the corresponding Maestro flow file and evidence screenshot(s)

## Completion note (fill at end per `docs/specs/04-ai-development-playbook.md`)

- 
