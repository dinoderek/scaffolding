---
task_id: T-20260301-04
milestone_id: "M10"
status: completed
ui_impact: "no"
areas: "frontend"
runtimes: "docs,expo,maestro,node"
gates_fast: "./scripts/quality-fast.sh frontend"
gates_slow: "./scripts/quality-slow.sh frontend"
docs_touched: "docs/specs/11-maestro-runtime-and-testing-conventions.md,docs/specs/06-testing-strategy.md"
---

# Task Card

## Task metadata

- Task ID: `T-20260301-04`
- Title: M10 Maestro harness, reset taxonomy, and flow migration
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

- Verified current branch + HEAD commit: `main @ b91c43b`
- Start-of-session sync completed per `docs/specs/04-ai-development-playbook.md` git sync workflow?: `yes` (`git pull --ff-only origin main` -> already up to date)
- Parent refs opened in this session:
  - `docs/specs/README.md`
  - `docs/specs/03-technical-architecture.md`
  - `docs/specs/04-ai-development-playbook.md`
  - `docs/specs/milestones/M10-maestro-parallel-runtime-and-testing-conventions.md`
  - `docs/specs/11-maestro-runtime-and-testing-conventions.md`
  - `docs/specs/06-testing-strategy.md`
  - `docs/specs/09-project-structure.md`
- Code/docs inventory freshness checks run:
  - current Maestro flows under `apps/mobile/.maestro/flows/**`
  - current route inventory under `apps/mobile/app/**`
  - data reset/persistence entrypoints under `apps/mobile/src/**`
- Known stale references or assumptions:
  - none after code/doc inventory review
- Optional helper command:
  - `./scripts/task-bootstrap.sh docs/tasks/T-20260301-04-m10-maestro-harness-reset-taxonomy-and-flow-migration.md`

## Objective

Add the app-side setup utilities M10 needs for reliable and fast Maestro runs, then migrate the current flows to use the new development-client runtime and the documented reset taxonomy instead of depending on slow or fragile Expo Go era setup steps.

## Scope

### In scope

- Add one or more hidden harness/debug entrypoints for Maestro setup actions such as:
  - full local app-data reset,
  - seed/minimal known-state preparation if needed,
  - deep-link based navigation to the target screen under test.
- Guard harness behavior so it is only available in intended development/test contexts.
- Migrate existing `smoke-launch.yaml` and `data-runtime-smoke.yaml` to the new development-client runtime contract.
- Replace unnecessary setup taps with:
  - documented app-data reset actions,
  - route/deep-link teleportation,
  - only the minimal UI interactions required by the behavior under test.
- Codify when `clearState` is appropriate versus when app-data reset or deep-link navigation is the correct mechanism.
- Preserve or update required screenshots/artifacts so the testing strategy remains measurable.

### Out of scope

- New product features unrelated to test harness support.
- Broad expansion of Maestro coverage beyond current smoke/data-smoke intent.
- Android-specific harness/deep-link behavior.

## UI Impact (required checkpoint)

- UI Impact?: `no`

## Acceptance criteria

1. Hidden Maestro/debug harness actions exist for the setup/reset cases M10 requires, and they are guarded from unintended production use.
2. The reset taxonomy is implemented and demonstrable:
   - full reset,
   - app-data reset,
   - deep-link/navigation teleportation.
3. Current smoke and data-smoke flows are migrated to the development-client runtime model and no longer rely on Expo Go specific assumptions.
4. Flow setup work is reduced where safe by using harness actions or deep links instead of brittle UI tapping.
5. Required smoke/data-smoke artifacts remain documented and are still produced by the updated flows.
6. Local frontend slow-gate execution passes against the updated flows/harness.

## Docs touched (required)

- Planned docs/spec files to update and why:
  - `docs/specs/11-maestro-runtime-and-testing-conventions.md` - document the implemented reset taxonomy and harness contract
  - `docs/specs/06-testing-strategy.md` - align Maestro testing policy to the new reset/deep-link conventions

## Testing and verification approach

- Planned checks/commands:
  - targeted tests for any new harness/reset helper logic where unit coverage is practical
  - `./scripts/quality-fast.sh frontend`
  - `./scripts/quality-slow.sh frontend`
- Standard local gate usage:
  - `./scripts/quality-fast.sh frontend` (required)
  - `./scripts/quality-slow.sh frontend` (required; flow/runtime behavior changes are the task itself)
- Test layers covered:
  - unit/integration checks for harness helpers when applicable
  - frontend lint/typecheck/test fast gate
  - real iOS simulator Maestro smoke/data-smoke slow gate
- Execution triggers:
  - always for both fast and slow gates
- Slow-gate triggers:
  - any change under `apps/mobile/.maestro/**`,
  - any new harness/debug route,
  - any change to data reset/deep-link test setup behavior
- Hosted/deployed smoke ownership: `N/A`
- CI/manual posture note: no CI configured; local runtime evidence is mandatory

## Implementation notes

- Planned files/areas allowed to change:
  - `apps/mobile/.maestro/**`
  - `apps/mobile/app/**`
  - `apps/mobile/src/**`
  - `apps/mobile/components/**` only if minimal harness wiring needs shared helpers
  - `apps/mobile/package.json` if command surfaces need updating
  - `docs/specs/11-maestro-runtime-and-testing-conventions.md`
  - `docs/specs/06-testing-strategy.md`
- Project structure impact:
  - no new top-level folders expected
- Constraints/assumptions:
  - keep harness entrypoints invisible to normal users
  - optimize for repeatable setup, not for expanding product surface

## Mandatory verify gates

- Standard local fast gate: `./scripts/quality-fast.sh frontend`
- Standard local slow gate: `./scripts/quality-slow.sh frontend`
- Optional closeout helper: `./scripts/task-closeout-check.sh docs/tasks/T-20260301-04-m10-maestro-harness-reset-taxonomy-and-flow-migration.md`
- Additional gate(s), if any:
  - targeted harness/deep-link test commands if added during implementation

## Evidence

- Harness/reset surface summary:
  - added `apps/mobile/app/maestro-harness.tsx` plus `apps/mobile/src/maestro/harness.ts`
  - added `resetLocalAppData()` in `apps/mobile/src/data/bootstrap.ts`
  - added `MAESTRO_RESET_STRATEGY` handling so smoke uses toolkit-level `full reset` and data-smoke uses app-level `data reset`
- Updated flow behavior summary, including where UI setup was replaced by reset/deep-link actions:
  - `smoke-launch.yaml` now confirms launch visibility, then teleports to `/session-recorder` through `mobile://maestro-harness?teleport=session-recorder`
  - `data-runtime-smoke.yaml` now uses `mobile://maestro-harness?reset=data&teleport=session-recorder` before performing the insert/read flow
- Fast-gate and slow-gate result summary:
  - `./scripts/quality-fast.sh frontend` passed
  - `./scripts/quality-slow.sh frontend` passed
- Manual verification summary (CI absent), including screenshots/artifacts captured:
  - smoke artifacts: `apps/mobile/artifacts/maestro/ad-hoc/20260301-205924-84042/` (`01-app-launch`, `02-session-recorder-visible`)
  - data-smoke artifacts: `apps/mobile/artifacts/maestro/ad-hoc/20260301-210005-85476/` (`03-data-runtime-smoke-start`, `04-data-runtime-smoke-success`)

Manual verification summary: local simulator verification was required because CI is absent; both Maestro flows passed against the real iOS simulator runtime and produced the expected screenshot artifacts under the recorded artifact roots.
manual verification summary: local simulator verification was required because CI is absent; both Maestro flows passed against the real iOS simulator runtime and produced the expected screenshot artifacts under the recorded artifact roots.

## Completion note (fill at end per `docs/specs/04-ai-development-playbook.md`)

- What changed: implemented a guarded hidden Maestro harness route for `data reset` and `teleport`; added runtime SQLite reset support and focused unit coverage; migrated smoke/data-smoke flows to the reset taxonomy and added runner-level `full reset` handling; updated `docs/specs/11-maestro-runtime-and-testing-conventions.md` and `docs/specs/06-testing-strategy.md` to reflect the implemented contract.
- What tests ran: `npm test -- --runInBand app/__tests__/local-data-bootstrap.test.ts app/__tests__/maestro-harness.test.ts`; `npm run typecheck`; `npm run lint`; `./scripts/quality-fast.sh frontend`; `./scripts/quality-slow.sh frontend`.
- What remains: milestone follow-up `T-20260301-05` still needs to align shared runbooks/playbook docs to the final M10 contract.

## Status update checklist (mandatory at closeout)

- Update `Status` to `completed` or `blocked`.
- Ensure completion note is filled before handoff.
- If significant project-structure changes were made, update `docs/specs/09-project-structure.md` and mention it in completion note.
- Update parent milestone task breakdown/status in the same session.
- Run `./scripts/task-closeout-check.sh docs/tasks/T-20260301-04-m10-maestro-harness-reset-taxonomy-and-flow-migration.md` (or document why `N/A`) before handoff.
