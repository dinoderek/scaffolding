# Task Card

## Task metadata

- Task ID: `T-20260220-10`
- Title: M5 user concept, authentication, authorization, and security baseline
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

Implement MVP backend user identity model, a controlled user-provisioning mechanism for this stage, and secure authentication/authorization rules so all backend data operations are user-scoped and protected.

## Scope

### In scope

- Define user concept and ownership model for backend records.
- Implement mechanism to add users in this stage without FE integration (for example: controlled invite list or admin provisioning flow).
- Implement authentication flow(s) required for MVP access.
- Implement authorization enforcement for user-owned data.
- Add secure defaults:
  - input validation
  - secure secret handling patterns
  - baseline abuse controls for auth endpoints
  - minimal audit/error logging discipline
- Implement contract tests for auth success/failure and cross-user access denial.

### Out of scope

- FE auth UI flows.
- Social/group authorization rules.
- Advanced enterprise security controls beyond MVP baseline.

## Acceptance criteria

1. User identity model is defined and mapped to app-owned entities.
2. A user-provisioning mechanism exists for this stage and is documented/tested.
3. Authentication flow works for MVP-required cases and produces verifiable identity context for API requests.
4. Authorization policies enforce per-user ownership constraints across protected entities.
5. Negative-path tests prove unauthorized and cross-user access is blocked.
6. Security baseline controls for validation, secrets, and auth endpoint hardening are implemented and documented.
7. Backend quality gates and contract tests pass.

## Testing and verification approach

- Planned checks/commands (from backend workspace):
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
  - targeted auth/authz contract tests (suite naming to be defined in-session)
- Notes:
  - Include at least one explicit cross-user access-denied test per protected resource family.

## Implementation notes

- Planned files/areas allowed to change:
  - `apps/backend/**`
  - `docs/specs/03-technical-architecture.md` (if auth/authz decision details need to be codified)
  - `docs/specs/milestones/M5-backend-foundation-authz-and-sync-api.md`
  - `docs/tasks/T-20260220-10-m5-user-auth-authz-and-security-baseline.md`
- Constraints/assumptions:
  - Must build on backend scaffold from `T-20260220-08`.
  - Must align with backend contract-test intent in `docs/specs/06-testing-strategy.md`.

## Mandatory verify gates

- `npm run lint` (from `apps/backend`)
- `npm run typecheck` (from `apps/backend`)
- `npm run test` (from `apps/backend`)
- Auth/authz contract test suite command (from `apps/backend`)

## Evidence

- Auth flow success/failure test summary.
- User-provisioning flow summary.
- Authorization denial test summary.
- Security baseline checklist summary.
- Lint/typecheck/test summary.

## Completion note

- What changed:
- What tests ran:
- What remains:
