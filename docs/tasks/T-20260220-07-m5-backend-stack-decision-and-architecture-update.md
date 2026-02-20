# Task Card

## Task metadata

- Task ID: `T-20260220-07`
- Title: M5 backend stack decision and architecture update
- Status: `planned`
- Owner: `AI + human reviewer`
- Session date: `2026-02-20`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- MVP deliverables: `docs/specs/00-mvp-deliverables.md#2-backend-foundation-and-basic-auth`
- MVP deliverables: `docs/specs/00-mvp-deliverables.md#4-session-sync-between-fe-and-backend`
- Milestone spec: `docs/specs/milestones/M5-backend-foundation-authz-and-sync-api.md`
- Architecture (if relevant): `docs/specs/03-technical-architecture.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`

## Objective

Select the MVP backend stack using explicit criteria for development velocity, free-tier fit, strict spend control, and paid-scale upgrade path, then codify the decision in architecture docs.

## Scope

### In scope

- Lock and use these evaluation criteria:
  - cloud provider availability with a generous free tier
  - spending cap support or ability to stay on free tier without requiring uncapped credit-card spend
  - local fast test capability with high accuracy/coverage to minimize post-deployment testing
  - ability to run a local server runtime (preferred, not mandatory)
  - portability/ease of switching cloud providers
  - lean runtime footprint and efficient deployed resource usage
  - fast development loop (quick startup and quick testing)
- Review candidate stacks and capture key tradeoffs against the locked criteria.
- Required candidate stacks include `Supabase` and `Cloudflare Workers`.
- Include a recommendation with:
  - primary choice
  - fallback option
  - tradeoff summary
- Record how the selected option can operate with zero spend initially or strict predefined spend limits.
- Update `docs/specs/03-technical-architecture.md` with selected platform and rationale.
- Capture assumptions that future backend implementation tasks depend on.

### Out of scope

- Backend runtime scaffolding and code implementation.
- Deployment scripts.
- Auth/authz implementation.
- API endpoint implementation.

## Acceptance criteria

1. A decision record exists in milestone/task docs with considered options, selected stack, rationale, and key tradeoffs.
2. Decision record explicitly evaluates `Supabase` and `Cloudflare Workers`.
3. Final recommendation includes primary + fallback and reasons for both.
4. Decision record explicitly captures spending controls (zero-spend operation or predefined capped spend path).
5. Decision record explicitly captures portability implications and expected effort to switch providers later.
6. Decision record explicitly captures local-test fidelity expectations and how post-deployment test needs are minimized.
7. `docs/specs/03-technical-architecture.md` is updated to reflect selected stack and status.
8. Implementation assumptions are explicit enough for follow-up tasks to proceed without re-opening stack choice.

## Testing and verification approach

- Planned checks/commands:
  - editorial consistency pass across touched spec files
  - link/reference sanity check for all added/updated docs
- Notes:
  - This is a docs-only decision task; no runtime code/test gate is required.

## Implementation notes

- Planned files/areas allowed to change:
  - `docs/specs/03-technical-architecture.md`
  - `docs/specs/milestones/M5-backend-foundation-authz-and-sync-api.md`
  - `docs/tasks/T-20260220-07-m5-backend-stack-decision-and-architecture-update.md`
- Constraints/assumptions:
  - Do not lock implementation details not needed for milestone-level decisions.
  - Keep selection criteria concrete and auditable.

## Mandatory verify gates

- `N/A (docs-only task; no code runtime changes)`

## Evidence

- Decision record summary.
- Criteria-by-candidate comparison summary.
- Architecture diff summary.
- Explicit final recommendation statement.

## Completion note

- What changed:
- What tests ran:
- What remains:
