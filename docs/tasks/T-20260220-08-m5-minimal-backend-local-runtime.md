# Task Card

## Task metadata

- Task ID: `T-20260220-08`
- Title: M5 minimal backend local runtime scaffold
- Status: `planned`
- Owner: `AI + human reviewer`
- Session date: `2026-02-20`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- MVP deliverables: `docs/specs/00-mvp-deliverables.md#2-backend-foundation-and-basic-auth`
- Milestone spec: `docs/specs/milestones/M5-backend-foundation-authz-and-sync-api.md`
- Architecture (if relevant): `docs/specs/03-technical-architecture.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`

## Objective

Create the smallest backend implementation baseline that runs locally, supports schema migration, and exposes a health endpoint.

## Scope

### In scope

- Create backend workspace scaffold (expected target: `apps/backend`).
- Add environment configuration strategy for local development.
- Implement local startup command(s) and a health endpoint.
- Add first migration/schema baseline for user-owned session domain entities.
- Document local setup/run steps in backend README/runbook.
- Add foundational automated tests for bootstrap and health behavior.
- Establish backend testing strategy layers for this stage:
  - unit tests
  - integration tests
  - component/API handler tests (or nearest stack-equivalent)
  - deployed-environment validation tests
- Update AI execution/testing policy docs for backend development expectations.

### Out of scope

- Deployment to cloud environments.
- Full auth/authz policy implementation.
- FE integration or sync client logic.

## Acceptance criteria

1. Backend workspace exists with reproducible local startup and dependency install flow.
2. Local backend starts successfully and returns healthy status from a documented endpoint.
3. Migration/bootstrap flow runs from clean state using documented command(s).
4. Baseline schema exists for upcoming auth and sync API tasks.
5. Testing strategy is established for backend with explicit unit/integration/component/deployed test layers.
6. Backend quality gates reach FE-like baseline quality (`lint`, `typecheck`, fast local tests, and e2e/deployed validation test path).
7. `docs/specs/04-ai-development-playbook.md` and `docs/specs/06-testing-strategy.md` are updated for backend workflow and quality expectations.

## Testing and verification approach

- Planned checks/commands (from backend workspace):
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
  - stack-specific fast integration/API test command(s)
  - stack-specific e2e/deployed validation command(s) or scripted check path
  - backend migration command (stack-specific; document exact command once stack is selected)
- Notes:
  - Keep runtime checks deterministic and CI-safe.

## Implementation notes

- Planned files/areas allowed to change:
  - `apps/backend/**` (new)
  - `docs/specs/04-ai-development-playbook.md`
  - `docs/specs/06-testing-strategy.md`
  - `docs/specs/milestones/M5-backend-foundation-authz-and-sync-api.md`
  - `docs/tasks/T-20260220-08-m5-minimal-backend-local-runtime.md`
- Constraints/assumptions:
  - Must align to stack decision from `T-20260220-07`.
  - Keep initial scaffold minimal and secure-by-default.

## Mandatory verify gates

- `npm run lint` (from `apps/backend`)
- `npm run typecheck` (from `apps/backend`)
- `npm run test` (from `apps/backend`)
- stack-specific fast integration/API test command(s) (from `apps/backend`)
- stack-specific e2e/deployed validation command(s) or scripted check path (from `apps/backend`)
- Stack-specific local migration/bootstrap command (from `apps/backend`)

## Evidence

- Local startup command output summary.
- Health endpoint response summary.
- Migration/bootstrap output summary.
- Lint/typecheck/test summary.
- Integration/component/e2e validation summary.
- Spec updates summary for `docs/specs/04-ai-development-playbook.md` and `docs/specs/06-testing-strategy.md`.

## Completion note

- What changed:
- What tests ran:
- What remains:
