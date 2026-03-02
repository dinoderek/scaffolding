# Task Card

## Task metadata

- Task ID: `T-20260225-12`
- Title: M5 standard fast quality gate command and testing checklist rationalization
- Status: `completed`
- Owner: `AI + human reviewer`
- Session date: `2026-02-25`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- MVP deliverables: `docs/specs/00-mvp-deliverables.md#2-backend-foundation-and-basic-auth`
- MVP deliverables: `docs/specs/00-mvp-deliverables.md#4-session-sync-between-fe-and-backend`
- Milestone spec: `docs/specs/milestones/M5-backend-foundation-authz-and-sync-api.md`
- Architecture (if relevant): `docs/specs/03-technical-architecture.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`
- Project structure: `docs/specs/09-project-structure.md`

## Objective

Define and implement a standard local fast quality-gate command path (or wrapper set) that runs applicable linters/typechecks/fast tests across touched workspaces, then simplify task verification checklists and docs to reference that standard gate consistently.

## Scope

### In scope

- Inventory current verification commands used in task cards (mobile and emerging backend tasks).
- Define a standard local fast quality-gate command path:
  - preferred single entrypoint (for example repo-level script/command)
  - documented fallback per-workspace commands when a workspace is absent/not yet introduced
  - explicit scope and limits (what the fast gate covers vs task-specific/manual checks)
- Implement the command/wrapper(s) for currently available workspaces and scripts.
- Define naming convention for quality gates (for example `quality:fast`, `verify:fast`, or equivalent shell wrapper) and document rationale.
- Rationalize task-card checklist language to reduce repetition while preserving task-specific required checks.
- Update docs to reflect no-CI posture and how the standard gate is used during local task closeout.
- Update M5 task cards as needed to reference the standard gate without weakening task-specific backend checks.

### Out of scope

- CI pipeline implementation.
- Replacing task-specific mandatory checks (for example `supabase db reset`, hosted smoke, Maestro flows) with the fast gate.
- Full release verification orchestration.

## Acceptance criteria

1. A standard local fast quality-gate command path (or documented wrapper set) exists and is runnable from a documented location.
2. The standard gate clearly defines covered checks and explicitly lists excluded checks that remain task-specific/manual.
3. `docs/specs/04-ai-development-playbook.md`, `docs/specs/06-testing-strategy.md`, and task template(s) are updated to reference the standard gate appropriately.
4. Relevant M5 task cards use the standard gate where it reduces checklist duplication without obscuring backend-specific requirements.
5. Documentation explicitly notes the current no-CI posture and how the standard local gate fits into manual verification.
6. The chosen command path is compatible with current repo structure and documented in `docs/specs/09-project-structure.md` if new canonical script locations are introduced.

## Testing and verification approach

- Planned checks/commands:
  - run the new standard fast quality gate command path
  - run at least one underlying workspace command directly (sanity check wrapper parity)
  - docs consistency review across playbook/testing strategy/templates/touched task cards
- Test layers covered:
  - local lint/typecheck/fast tests only (no hosted smoke, no CI)
- Execution triggers (`always`, file-change-triggered, milestone closeout, release closeout):
  - run for tasks that modify app/backend code in covered workspaces
  - run before task closeout when the task touches covered code paths
- CI/manual posture note (required when CI is absent or partial):
  - CI is not configured; this task defines local fast-gate standards and documents what remains manual.
- Notes:
  - Keep the standard gate additive: it should simplify repetitive checklists, not hide task-specific risk checks.

## Implementation notes

- Planned files/areas allowed to change:
  - repo-level script locations and/or package scripts (exact paths chosen in-session)
  - `apps/mobile/package.json` and related script docs (if needed)
  - backend helper workspace/package scripts (if present)
  - `docs/specs/04-ai-development-playbook.md`
  - `docs/specs/06-testing-strategy.md`
  - `docs/specs/09-project-structure.md` (if canonical script locations/conventions change)
  - `docs/specs/templates/task-card-template.md`
  - `docs/specs/milestones/M5-backend-foundation-authz-and-sync-api.md`
  - `docs/tasks/complete/T-20260225-12-m5-quality-gate-command-and-testing-checklist-rationalization.md`
  - other M5 task cards that benefit from checklist simplification (as needed)
- Project structure impact (new paths/conventions or explicit no-structure-change decision):
  - likely introduces or confirms a canonical repo-level script/wrapper location for quality gates.
- Constraints/assumptions:
  - Must not weaken backend-specific verification requirements introduced in `T-20260220-08` through `T-20260220-11`.
  - Must preserve explicit manual/hosted checks while CI is absent.

## Mandatory verify gates

- Standard fast quality-gate command path (new)
- Underlying command parity spot-check (at least one direct lint/typecheck/test command)
- Documentation diff/review across playbook/testing strategy/templates/touched task cards

## Evidence

- Standard quality-gate command definition and scope summary.
- Example run summary (what checks executed and what was intentionally excluded).
- Checklist simplification summary across touched task cards/docs.
- Manual verification summary (required when CI is absent/partial):
  - what remains manual after this task and where it is documented.

## Completion note

- What changed:
- Added repo-level standard local quality-gate wrappers:
  - `./scripts/quality-fast.sh` (default-all + optional `frontend|backend`)
  - `./scripts/quality-slow.sh` (default-all + optional `frontend|backend`)
- Documented wrapper scope and limits in the shared docs:
  - `docs/specs/04-ai-development-playbook.md`
  - `docs/specs/06-testing-strategy.md`
  - `docs/specs/09-project-structure.md` (new repo-root `scripts/` canonical wrapper location)
- Updated `docs/specs/templates/task-card-template.md` to reduce verify-checklist repetition and require explicit `quality-slow` triggers when applicable.
- Captured the simplifying quality-gate matrix and decisions in `docs/brainstorms/T-20260225-12-quality-gates-simplest-setup.md` (`speed x area`, local-first now, deployed later).
- Chose `quality-fast` naming and default-all behavior; classified current `Maestro` checks as `frontend + slow` and backend auth/RLS/API contract suites as `backend + slow`.
- Did not retroactively rewrite historical M5 task cards in this session to avoid churn; template + shared docs now define the standard for future/updated tasks.
- What tests ran:
- `./scripts/quality-fast.sh frontend` -> executed wrapper successfully through frontend `lint`; failed at frontend `typecheck` due pre-existing mobile route typing errors in `apps/mobile` (not introduced by this task)
- `cd apps/mobile && npm run lint` -> passed (wrapper parity spot-check for one underlying workspace command)
- Documentation diff/review across touched shared docs + task template -> completed
- What remains:
- Historical note: at the time of this task, M5 task `T-20260220-09` was still pending; it was later marked `outdated` when M5 was re-scoped to close on the delivered local backend/auth/sync baseline.
- Separate follow-up to fix existing `apps/mobile` typecheck errors is needed if we want `./scripts/quality-fast.sh frontend` to pass end-to-end on current branch.

## Status update checklist (mandatory at closeout)

- Update `Status` to `completed` or `blocked`.
- Ensure completion note is filled before handoff.
- If significant project-structure changes were made, update `docs/specs/09-project-structure.md` and mention it in completion note.
- Update parent milestone task breakdown/status in the same session.
