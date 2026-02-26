# Project Structure (Current + Conventions)

## Purpose

Define the canonical repository structure, path ownership, and placement conventions so implementation and test assets land in predictable locations.

## Maintenance rule

- Update this document in the same task/session when significant project-structure changes are made (for example new top-level folders, workspace moves, canonical test-location changes, or path-convention changes).
- Minor file additions within an existing well-defined folder usually do not require updates.

## Current repository structure (verified 2026-02-26)

```text
/
  AGENTS.md
  scripts/                       # Repo-level cross-workspace wrappers (quality gates, orchestration)
  apps/
    mobile/                      # Expo React Native app (current primary codebase)
      app/                       # Expo Router routes/screens
      app/__tests__/             # Current app-side test location (legacy/needs rationalization)
      components/                # UI components
        ui/                      # Canonical UI tokens + primitives foundation (M8+)
      src/                       # Non-route app code (domain/data/helpers)
      drizzle/                   # Mobile local DB schema/migrations artifacts
      .maestro/flows/            # Maestro flow definitions (canonical location)
      scripts/                   # Mobile/maestro helper scripts
      artifacts/maestro/         # Maestro output artifacts/screenshots
  supabase/                      # Supabase backend root (M5 local runtime + backend assets)
    migrations/                  # Postgres migrations
    seed.sql                     # Deterministic local seed fixtures
    functions/                   # Edge Functions (including health smoke endpoint)
    scripts/                     # Backend local runtime/test wrapper scripts
    tests/                       # Backend-local smoke/integration test entrypoints
  docs/
    specs/                       # Project/milestone/task process and technical specs
      ui/                        # Canonical UI discovery/audit/guardrail docs (M8+)
    tasks/                       # Task cards
    brainstorms/                 # Working notes and brainstorming docs
```

## Workspace ownership (current)

- `apps/mobile/`
  - owns the mobile app code, mobile-only tests, mobile SQLite schema artifacts, Maestro flows, and mobile test helper scripts.
- `apps/mobile/components/ui/`
  - owns the canonical mobile UI tokens + primitive components introduced in M8 for reuse across route screens and specialized shared components.
- `scripts/`
  - owns repo-level cross-workspace wrappers (for example standard local quality-gate commands).
- `docs/specs/`
  - owns project policy, architecture/testing strategy, milestone specs, and templates.
- `docs/specs/ui/`
  - owns authoritative UI discovery/audit/guardrail documentation produced in M8+ tasks.
- `docs/tasks/`
  - owns per-session execution task cards.
- `docs/brainstorms/`
  - owns non-authoritative ideation notes (helpful context, not source of truth).
- `supabase/`
  - owns local Supabase backend config, migrations, seeds, Edge Functions, and backend-local test/runtime wrappers.

## Agreed structure conventions (M5+ additions)

- `supabase/` (introduced in M5)
  - backend root for local Supabase project assets (migrations, seeds, functions, and backend-local tests).
- `docs/specs/ui/` (introduced in M8)
  - canonical location for authoritative UI discovery/audit/guardrail docs (for example repo discovery baseline, pattern audit, screen map, navigation contract, components catalog, UX rules).
  - keep UI docs under `docs/specs/ui/**` rather than `docs/brainstorms/**` once they become source-of-truth references.
- `apps/mobile/.maestro/flows`
  - remains the canonical location for Maestro flow definitions.
- `apps/mobile/components/ui/` (introduced in M8)
  - canonical location for mobile UI tokens and primitive components used by shared/screen UI code.
  - keep specialized feature components (for example navigation/session-layout components) in domain folders under `apps/mobile/components/**`; compose primitives from `apps/mobile/components/ui/**`.
- `e2e/` (reserved)
  - reserved for cross-stack orchestration/tests that span mobile + backend.
  - strategy may be documented before implementation exists.
- `scripts/` (repo root)
  - canonical location for repo-level cross-workspace wrappers (for example `./scripts/quality-fast.sh`, `./scripts/quality-slow.sh`).
  - keep workspace-specific wrappers in the owning workspace (for example `apps/mobile/scripts/**`, `supabase/scripts/**`).
- Mobile test-directory refactor
  - moving tests out of `apps/mobile/app/__tests__/` is a valid follow-up improvement, but it must be done in a dedicated task (not mixed into unrelated backend work).

## Placement guidance

- Put code near the runtime/workspace that owns it:
  - mobile app code/tests in `apps/mobile/**`
  - Supabase backend assets in `supabase/**`
  - cross-stack orchestration in repo-root `e2e/**` and/or shared `scripts/**` (as documented)
- Prefer one canonical location per test/tool type and document exceptions in `docs/specs/06-testing-strategy.md`.
- If a new folder becomes canonical for a subsystem or test type, update this doc and any impacted templates/playbook references in the same task.

## Known cleanup opportunities (tracked)

- Rationalize mobile test placement currently under `apps/mobile/app/__tests__/` into a dedicated mobile test directory (deferred to a dedicated follow-up task).
- Optional follow-up: add a repo-root command alias surface (for example root `package.json` script aliases) if ergonomics justify it; current canonical wrappers are `./scripts/quality-fast.sh` and `./scripts/quality-slow.sh`.
