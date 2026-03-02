---
task_id: T-20260301-03
milestone_id: "M10"
status: completed
ui_impact: "no"
areas: "frontend"
runtimes: "docs,expo,maestro"
gates_fast: "./scripts/quality-fast.sh frontend"
gates_slow: "./scripts/quality-slow.sh frontend"
docs_touched: "docs/specs/11-maestro-runtime-and-testing-conventions.md,docs/specs/milestones/M10-maestro-parallel-runtime-and-testing-conventions.md"
---

# Task Card

## Task metadata

- Task ID: `T-20260301-03`
- Title: M10 parallel iOS runtime toolkit and teardown
- Status: `completed`
- Session date: `2026-03-01`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- Milestone spec: `docs/specs/milestones/M10-maestro-parallel-runtime-and-testing-conventions.md`
- Architecture: `docs/specs/03-technical-architecture.md`
- AI development playbook: `docs/specs/04-ai-development-playbook.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`
- Project structure: `docs/specs/09-project-structure.md`
- Maestro runtime contract: `docs/specs/11-maestro-runtime-and-testing-conventions.md`

## Context Freshness (required at session start; update before edits)

- Verified current branch + HEAD commit: `main @ ccb407358861b3550dd61f9ef02d6afff24b3dcd`
- Start-of-session sync completed per `docs/specs/04-ai-development-playbook.md` git sync workflow?: `yes` (`git fetch origin`; local `main` already matched `origin/main` at session start)
- Parent refs opened in this session:
  - `docs/specs/milestones/M10-maestro-parallel-runtime-and-testing-conventions.md`
  - `docs/specs/11-maestro-runtime-and-testing-conventions.md`
  - `docs/specs/06-testing-strategy.md`
  - `docs/specs/09-project-structure.md`
- Code/docs inventory freshness checks run:
  - `apps/mobile/scripts/ios-sim-boot.sh`
  - `apps/mobile/scripts/maestro-ios-slot-lock.sh`
  - `apps/mobile/scripts/maestro-ios-smoke.sh`
  - `apps/mobile/scripts/maestro-ios-data-smoke.sh`
- Known stale references or assumptions:
  - none after inventory refresh; runtime migration work remained to be implemented in this task
- Optional helper command:
  - `./scripts/task-bootstrap.sh docs/tasks/complete/T-20260301-03-m10-parallel-ios-runtime-toolkit-and-teardown.md`

## Objective

Implement the reusable runtime toolkit for M10 by separating provision, launch, and teardown responsibilities, persisting runtime state, and moving the current runners onto a development-client-based isolated runtime model that works across parallel worktrees.

## Scope

### In scope

- Refactor or replace the current runner scripts with a shared toolkit that covers:
  - simulator provisioning or deterministic resolution by configured identity,
  - simulator boot with retry/health handling,
  - development-client install/update,
  - Expo launch on an isolated port,
  - readiness checks before handing control to Maestro,
  - runtime state file emission,
  - teardown and cleanup after both success and partial failure.
- Decide whether the existing slot-lock script is retained, adapted, or replaced, while preserving cross-worktree safety.
- Write runtime logs and state artifacts that later scripts can consume instead of re-deriving process/device details.
- Keep or reintroduce the existing smoke/data-smoke command surface in `apps/mobile/package.json`, but have those commands run through the new toolkit.
- Remove duplicated logic between smoke and data-smoke runners where practical.

### Out of scope

- App-side harness route implementation.
- Deep-link setup taxonomy beyond the runtime handshake needed to load the bundle.
- Documentation-wide cleanup beyond the minimal contract updates needed for the toolkit to be understandable.

## UI Impact (required checkpoint)

- UI Impact?: `no`

## Acceptance criteria

1. The runtime toolkit has distinct provision, launch, and teardown responsibilities with clear inputs/outputs.
2. The toolkit no longer relies on Expo Go specific app IDs or Expo Go uninstall/reset behavior.
3. Runtime state artifacts exist and are sufficient to identify:
   - simulator/device used,
   - port used,
   - process ID(s) owned by the run,
   - artifact/log directory.
4. Teardown is safe after partial failure and does not leave stale slot/runtime ownership without a documented reason.
5. The current smoke/data-smoke entrypoints run through the shared toolkit rather than duplicated ad hoc boot/start logic.
6. A local frontend slow gate run validates the reworked runtime path on real iOS simulator execution. 

CRUCIAL: THE TESTS MUST RUN ON DEVELOPMENT BUILD NOW. NO EXPO GO ALLOWED.

## Docs touched (required)

- Planned docs/spec files to update and why:
  - `docs/specs/11-maestro-runtime-and-testing-conventions.md` - record finalized runtime toolkit contract and state/log outputs
  - `docs/specs/milestones/M10-maestro-parallel-runtime-and-testing-conventions.md` - update task progress and any runtime-contract clarifications discovered during implementation

## Testing and verification approach

- Planned checks/commands:
  - targeted toolkit script invocations for provision/launch/teardown behavior
  - `./scripts/quality-fast.sh frontend`
  - `./scripts/quality-slow.sh frontend`
- Standard local gate usage:
  - `./scripts/quality-fast.sh frontend` (required)
  - `./scripts/quality-slow.sh frontend` (required; runtime-tooling changes directly affect Maestro execution)
- Test layers covered:
  - script/runtime orchestration verification
  - frontend lint/typecheck/test fast gate
  - real iOS simulator Maestro smoke/data-smoke slow gate
- Execution triggers:
  - always for both fast and slow gates because runner/runtime behavior changes are the task itself
- Slow-gate triggers:
  - any change to Maestro runners, simulator helpers, slot locking, runtime state/cleanup, or Expo launch handshake
- Hosted/deployed smoke ownership: `N/A`
- CI/manual posture note: no CI configured; local runtime evidence is mandatory

## Implementation notes

- Planned files/areas allowed to change:
  - `apps/mobile/scripts/**`
  - `apps/mobile/package.json`
  - `apps/mobile/.maestro/**` only if runner contract changes require small flow metadata updates
  - `docs/specs/11-maestro-runtime-and-testing-conventions.md`
  - `docs/specs/milestones/M10-maestro-parallel-runtime-and-testing-conventions.md`
- Project structure impact:
  - no new top-level folders expected, but new canonical runtime-state or config paths may need later documentation in `docs/specs/09-project-structure.md`
- Constraints/assumptions:
  - preserve cross-worktree safety on one host
  - keep artifact directories task-aware and debuggable

## Mandatory verify gates

- Standard local fast gate: `./scripts/quality-fast.sh frontend`
- Standard local slow gate: `./scripts/quality-slow.sh frontend`
- Optional closeout helper: `./scripts/task-closeout-check.sh docs/tasks/complete/T-20260301-03-m10-parallel-ios-runtime-toolkit-and-teardown.md`
- Additional gate(s), if any:
  - targeted provision/launch/teardown command evidence if the slow gate alone does not expose enough lifecycle detail

## Evidence

- Runtime toolkit surface summary:
  - added `apps/mobile/scripts/maestro-ios-runtime.sh` shared helpers plus `maestro-ios-run-flow.sh`
  - added lifecycle entrypoints `maestro-ios-provision.sh`, `maestro-ios-launch.sh`, and `maestro-ios-teardown.sh`
  - kept `maestro-ios-smoke.sh` and `maestro-ios-data-smoke.sh` as thin scenario wrappers
  - retained `maestro-ios-slot-lock.sh`, but fixed lock ownership so it records the long-lived runner PID instead of the short-lived helper PID
- Runtime state/log artifact summary:
  - successful smoke artifact root: `apps/mobile/artifacts/maestro/ad-hoc/20260301-191439-59787`
  - successful data-smoke artifact root: `apps/mobile/artifacts/maestro/ad-hoc/20260301-191537-60914`
  - both runs emitted `runtime.env`, `provision.log`, `launch.log`, `teardown.log`, `expo-start.log`, `maestro-junit.xml`, `maestro-output/`, and `maestro-debug/`
  - `runtime.env` captured simulator identity, slot id/index, Expo port, dev-client app path/bundle id/URL, artifact paths, and owned Expo PID
- Fast-gate and slow-gate result summary:
  - `./scripts/quality-fast.sh frontend` passed
  - `./scripts/quality-slow.sh frontend` passed
- Manual verification summary (CI absent), including any failure-recovery behavior exercised:
  - exercised repeated partial-failure paths while iterating on launch readiness and development-client overlay dismissal; teardown consistently killed Expo and released the slot before the succeeding slow-gate run

Manual verification summary: local simulator-only verification was required because CI is absent; partial-failure runs confirmed teardown cleaned Expo processes and slot ownership before the final passing slow gate.
manual verification summary: local simulator-only verification was required because CI is absent; partial-failure runs confirmed teardown cleaned Expo processes and slot ownership before the final passing slow gate.

## Completion note (fill at end per `docs/specs/04-ai-development-playbook.md`)

- What changed: migrated the iOS Maestro runtime to a shared development-client toolkit with explicit provision/launch/teardown responsibilities and persisted runtime state; refactored the smoke/data-smoke entrypoints into thin wrappers over `maestro-ios-run-flow.sh`; updated the slot-lock helper to persist the caller PID for real cross-worktree ownership; updated the committed Maestro flows to target the development-client runtime and tolerate the current dev-client onboarding/dev-menu overlays while harness work remains pending.
- What tests ran: `bash -n apps/mobile/scripts/maestro-env.sh apps/mobile/scripts/maestro-ios-runtime.sh apps/mobile/scripts/ios-sim-boot.sh apps/mobile/scripts/maestro-ios-slot-lock.sh apps/mobile/scripts/maestro-ios-dev-client-build.sh apps/mobile/scripts/maestro-ios-provision.sh apps/mobile/scripts/maestro-ios-launch.sh apps/mobile/scripts/maestro-ios-teardown.sh apps/mobile/scripts/maestro-ios-run-flow.sh apps/mobile/scripts/maestro-ios-smoke.sh apps/mobile/scripts/maestro-ios-data-smoke.sh`; `apps/mobile/scripts/maestro-ios-dev-client-build.sh --status`; `apps/mobile/scripts/maestro-ios-run-flow.sh --help`; `./scripts/quality-fast.sh frontend`; `./scripts/quality-slow.sh frontend`.
- What remains: M10 harness/deep-link reset work and broader docs/runbook alignment remain with later milestone tasks.

## Status update checklist (mandatory at closeout)

- Update `Status` to `completed` or `blocked`.
- Ensure completion note is filled before handoff.
- If significant project-structure changes were made, update `docs/specs/09-project-structure.md` and mention it in completion note.
- Update parent milestone task breakdown/status in the same session.
- Run `./scripts/task-closeout-check.sh docs/tasks/complete/T-20260301-03-m10-parallel-ios-runtime-toolkit-and-teardown.md` (or document why `N/A`) before handoff.
