# Task Card

## Task metadata

- Task ID: `T-20260220-09`
- Title: M5 backend deployment strategy and environment model
- Status: `outdated`
- Owner: `AI + human reviewer`
- Session date: `2026-02-20`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- Product overview: `docs/specs/00-product.md`
- Milestone spec: `docs/specs/milestones/M5-backend-foundation-authz-and-sync-api.md`
- Architecture (if relevant): `docs/specs/03-technical-architecture.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`

## Objective

This task originally aimed to define the `Supabase` deployment path from free tier to paid scale with explicit environment boundaries and operational safeguards.

## Scope

### In scope

- historical record only; no further implementation in this task
- Define environment topology:
  - `local`
  - `preview/staging`
  - `production`
- Document deployment approach for `Supabase` primary, including how local Supabase development maps to hosted projects/environments.
- Decide and document preview strategy for MVP (`separate staging project`, `ephemeral/manual preview`, or `deferred preview`) with spend-control rationale.
- Define cost/safety guardrails for hosting and managed services:
  - zero-spend default where possible
  - predefined spend limit/budget threshold when paid usage is enabled
  - avoid uncapped auto-spend exposure
- Document `Supabase`-specific billing/spend caveats and operator guardrails (including any limits of platform spend caps and what must be enforced operationally).
- Define secrets management and rotation baseline.
- Define secrets handling for Supabase project settings and runtime functions (for example `anon` vs `service role` key usage boundaries).
- Define backup/restore and rollback expectations for hosted Supabase environments, including free-tier limitations and manual backup/restore procedures if managed backups are unavailable.
- Define scale-up triggers and migration plan from free tier to paid tier.
- Add deployment checklist suitable for repeatable release execution.
- Define hosted/deployed smoke validation command path and manual execution cadence while CI is not yet configured.

### Out of scope

- Full production infrastructure automation implementation.
- FE deployment or mobile release workflow changes.

## Acceptance criteria

1. Task status is explicitly marked `outdated`.
2. M5 references are updated so this task no longer blocks milestone closeout.
3. The completion note records that cloud deployment/environment work moved to a future milestone.

## Testing and verification approach

- Planned checks/commands:
  - documentation coherence review across architecture + milestone + deployment docs
  - command sanity check for any deployment helper script included in task scope
- Notes:
  - If automation/scripts are added, include dry-run evidence.
  - This task owns the hosted/deployed smoke validation command path that `T-20260220-08` only defines at an ownership/expectation level.

## Implementation notes

- Planned files/areas allowed to change:
  - `docs/specs/03-technical-architecture.md`
  - `docs/specs/milestones/M5-backend-foundation-authz-and-sync-api.md`
  - `docs/tasks/complete/T-20260220-09-m5-backend-deployment-strategy-and-environments.md`
  - deployment/runbook docs under `docs/` (exact path to be chosen in-session)
- Constraints/assumptions:
  - Must implement the `Supabase` primary path selected in `T-20260220-07`; fallback stack remains contingency-only documentation unless a blocker is declared.
  - Keep MVP operations simple; avoid over-engineering.
  - Local runtime requirement from `T-20260220-07` remains in force; deployment strategy must not assume cloud-only debugging.

## Mandatory verify gates

- `N/A (docs/planning task unless scripts are introduced)`

## Evidence

- Environment model summary.
- Free-tier-to-paid transition summary.
- Spend guardrail summary.
- Supabase-specific operator controls summary (including billing/spend-cap caveats and manual guardrails).
- Rollback and backup policy summary.
- Hosted/deployed smoke validation path summary (manual cadence while CI is absent).

## Completion note

- What changed:
  - Marked this task `outdated` after M5 was re-scoped to close on the delivered local backend, auth/authz baseline, and sync API baseline.
  - Deferred cloud deployment/environment strategy to a future milestone rather than treating it as remaining M5 work.
- What tests ran:
  - `N/A (planning/status realignment only)`
- What remains:
  - A separate future milestone should define hosted environment topology, secrets/rollback posture, spend controls, and hosted smoke validation once cloud work is prioritized.
