# Task Card

## Task metadata

- Task ID: `T-20260220-11`
- Title: M5 authenticated sync API for session domain entities
- Status: `planned`
- Owner: `AI + human reviewer`
- Session date: `2026-02-20`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- MVP deliverables: `docs/specs/00-mvp-deliverables.md#4-session-sync-between-fe-and-backend`
- Milestone spec: `docs/specs/milestones/M5-backend-foundation-authz-and-sync-api.md`
- Architecture (if relevant): `docs/specs/03-technical-architecture.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`

## Objective

Implement backend API methods to read/write user-scoped gym and session-tracking state (`gyms`, `sessions`, `session_exercises`, `exercise_sets`) with authentication and authorization enforced.

## Scope

### In scope

- Implement authenticated endpoints for sync domain entities:
  - `gyms`
  - `sessions`
  - `session_exercises`
  - `exercise_sets`
- Implement ownership-aware read/write behavior.
- Define API payload/response contracts for later FE integration.
- Add contract tests for:
  - success paths
  - validation failures
  - unauthorized requests
  - cross-user access denial
- Document endpoint catalog and example payloads.

### Out of scope

- FE integration and client sync engine wiring.
- Conflict-resolution policy beyond MVP-safe baseline.
- Group/social APIs.

## Acceptance criteria

1. Authenticated API read/write methods exist for all required session domain entities.
2. Every endpoint enforces user ownership semantics.
3. Unauthorized requests are rejected with deterministic error responses.
4. Cross-user access attempts are rejected and test-covered.
5. Endpoint contracts are documented and stable enough for a dedicated FE integration milestone.
6. Backend quality gates and contract tests pass.

## Testing and verification approach

- Planned checks/commands (from backend workspace):
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
  - targeted API contract test suite command(s) (to be finalized during implementation)
- Notes:
  - Include at least one end-to-end API flow per entity family and one negative ownership test per family.

## Implementation notes

- Planned files/areas allowed to change:
  - `apps/backend/**`
  - `docs/specs/03-technical-architecture.md` (if API-layer architecture decisions need codification)
  - `docs/specs/milestones/M5-backend-foundation-authz-and-sync-api.md`
  - `docs/tasks/T-20260220-11-m5-sync-api-for-session-domain.md`
- Constraints/assumptions:
  - Must build on auth/authz baseline from `T-20260220-10`.
  - Keep API contracts MVP-minimal and explicit.

## Mandatory verify gates

- `npm run lint` (from `apps/backend`)
- `npm run typecheck` (from `apps/backend`)
- `npm run test` (from `apps/backend`)
- API contract test suite command(s) (from `apps/backend`)

## Evidence

- Endpoint catalog summary.
- API contract test results summary.
- Unauthorized/cross-user denial evidence summary.
- Lint/typecheck/test summary.

## Completion note

- What changed:
- What tests ran:
- What remains:
