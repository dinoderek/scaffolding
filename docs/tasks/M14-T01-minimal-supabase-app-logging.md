---
task_id: M14-T01-minimal-supabase-app-logging
milestone_id: "M14"
status: planned
ui_impact: "no"
areas: "cross-stack"
runtimes: "expo|supabase|sql"
gates_fast: "./scripts/quality-fast.sh frontend"
gates_slow: "N/A"
docs_touched: "docs/specs/milestones/M14-observability-and-diagnostics.md, docs/specs/05-data-model.md, docs/specs/03-technical-architecture.md"
---

# Task Card

## Task metadata

- Task ID: `M14-T01-minimal-supabase-app-logging`
- Title: Minimal Supabase-backed app logging
- Status: `planned`
- File location rule:
  - author active card in `docs/tasks/M14-T01-minimal-supabase-app-logging.md`
  - move the file to `docs/tasks/complete/M14-T01-minimal-supabase-app-logging.md` when `Status` becomes `completed` or `outdated`
- Session date: `2026-05-07`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- Milestone spec: `docs/specs/milestones/M14-observability-and-diagnostics.md`
  - If this milestone spec does not exist yet, create a lightweight milestone spec before implementation or replace `M14` with the correct existing milestone ID.
- Architecture: `docs/specs/03-technical-architecture.md`
- Data model: `docs/specs/05-data-model.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`
- Project structure: `docs/specs/09-project-structure.md`

## Context Freshness (required at session start; update before edits)

- Verified current branch + HEAD commit:
- Start-of-session sync completed per `docs/specs/04-ai-development-playbook.md` git sync workflow?: `yes | no | N/A` (explain)
- Parent refs opened in this session:
  - `docs/specs/README.md`
  - `docs/specs/milestones/M14-observability-and-diagnostics.md` or replacement milestone spec
  - `docs/specs/03-technical-architecture.md`
  - `docs/specs/05-data-model.md`
  - `docs/specs/06-testing-strategy.md`
  - `docs/specs/09-project-structure.md`
- Code/docs inventory freshness checks run:
  - Confirm existing mobile Supabase client location: `apps/mobile/src/auth/supabase.ts`
  - Confirm auth service location: `apps/mobile/src/auth/service.ts`
  - Confirm sync runtime/engine/bootstrap locations:
    - `apps/mobile/src/sync/runtime.ts`
    - `apps/mobile/src/sync/engine.ts`
    - `apps/mobile/src/sync/bootstrap.ts`
  - Confirm Supabase migration folder: `supabase/migrations/`
  - Confirm whether `expo-constants` is already present in the mobile app dependencies.
- Known stale references or assumptions:
  - The backend for this task is assumed to be Supabase/Postgres/RPC, not a separate Node/Next.js service.
  - Replace `M14` if the project already has a more appropriate milestone.
- Optional helper command:
  - `./scripts/task-bootstrap.sh docs/tasks/M14-T01-minimal-supabase-app-logging.md`

## Objective

Implement a minimal production logging mechanism for BoGa using Supabase only.

This task intentionally avoids external logging providers such as Sentry, Better Stack, Axiom, Firebase, or similar. The desired implementation is deliberately small: one Supabase table, one mobile logging helper, and a few high-value instrumentation points for auth and sync failures.

The purpose is to capture basic production diagnostics such as failed auth restore, failed sign-in, failed sync RPC calls, sync bootstrap failures, and remote fetch failures without building a full observability platform. Humanity may survive without another dashboard.

## Scope

### In scope

- Add a Supabase migration for `public.app_logs`.
- Enable RLS on `public.app_logs`.
- Allow authenticated users to insert logs.
- Do not allow client-side SELECT, UPDATE, or DELETE on logs.
- Add indexes useful for manual inspection in Supabase Dashboard / SQL Editor.
- Add a reusable mobile logging helper at `apps/mobile/src/logging/logEvent.ts`.
- Reuse the existing mobile Supabase client from `apps/mobile/src/auth/supabase.ts`.
- Add minimal instrumentation to:
  - `apps/mobile/src/auth/service.ts`
  - `apps/mobile/src/sync/runtime.ts`
  - `apps/mobile/src/sync/engine.ts`
  - `apps/mobile/src/sync/bootstrap.ts`
- Add `expo-constants` to the mobile app dependencies if missing.
- Update relevant architecture/data-model docs if this logging table becomes part of the shared project contract.

### Out of scope

- Sentry, Better Stack, Axiom, Firebase, Crashlytics, or any external logging provider.
- A full observability stack.
- A dashboard UI inside the app.
- Admin screens for logs.
- A separate backend/service-role logger, unless an actual backend runtime already exists in the repo.
- Broad instrumentation of every `supabase.from()` call.
- Broad instrumentation of every file matching `**/session*.ts`.
- Logging full payloads, auth/session/user objects, passwords, tokens, or large sync event bodies.

## UI Impact (required checkpoint)

- UI Impact?: `no`
- Rationale:
  - This task adds infrastructure, database schema, and mobile diagnostic instrumentation only.
  - It should not change visible app UI, navigation, copy, styling, interaction flows, or documented UI contracts.
  - Remove UI-only sections from this task card.

## Acceptance criteria

1. A Supabase migration creates `public.app_logs` with the required columns, constraints, RLS, policies, and indexes.
2. The migration lives under `supabase/migrations/` and uses a timestamped filename following the existing repo convention.
3. The migration is idempotent where practical:
   - `CREATE TABLE IF NOT EXISTS`
   - `CREATE INDEX IF NOT EXISTS`
   - policy creation guarded through a `DO` block checking `pg_policies`
4. `public.app_logs` allows authenticated INSERT only.
5. Clients cannot SELECT, UPDATE, or DELETE `app_logs` rows.
6. A reusable mobile helper exists at `apps/mobile/src/logging/logEvent.ts`.
7. The helper reuses `getSupabaseMobileClient()` from `apps/mobile/src/auth/supabase.ts`.
8. `getSupabaseMobileClient()` is treated correctly:
   - it is synchronous
   - it returns a Supabase client or `null`
   - it must not be awaited
9. `logEvent()` returns immediately if `getSupabaseMobileClient()` returns `null`.
10. `logEvent()` wraps its whole body in `try/catch` and never throws.
11. `source` is optional in the TypeScript params but defaults to `'app'` before insert, because the database column is `NOT NULL`.
12. `platform` is set from `Platform.OS` from `react-native`.
13. `app_version` is set from `expo-constants`:
    - `Constants.expoConfig?.version ?? Constants.nativeAppVersion ?? 'unknown'`
14. If `expo-constants` is not already present in the mobile app dependencies, it is added to the mobile app.
15. `context` uses `Record<string, unknown>`.
16. No detailed context schema is enforced yet.
17. Sensitive context keys are stripped before insert.
18. Auth restore and sign-in failures are logged.
19. Sync ingest RPC, sync bootstrap, sync flush transport, and sync bootstrap remote fetch failures are logged.
20. No broad instrumentation sweep is performed.
21. No external logging provider is introduced.
22. No full auth objects, session objects, user objects, passwords, tokens, or large sync payloads are logged.
23. Existing auth and sync behaviour is not changed except for non-blocking log attempts.
24. Relevant docs are updated or explicit no-update rationale is recorded.

## Docs touched (required)

- Planned docs/spec files to update and why:
  - `docs/specs/milestones/M14-observability-and-diagnostics.md` - create or update a lightweight milestone spec for diagnostics/logging if `M14` is the chosen milestone.
  - `docs/specs/05-data-model.md` - document `public.app_logs` if this table is considered part of the durable data model.
  - `docs/specs/03-technical-architecture.md` - document the minimal logging approach if diagnostics/logging becomes part of the app architecture contract.
- If a more appropriate existing milestone exists, replace `M14` and update this task card accordingly.
- UI docs update required?: `no`
  - Rationale: this task has no UI impact.

## Testing and verification approach

- Planned checks/commands:
  - Inspect generated migration for RLS, policies, constraints, and indexes.
  - Run existing mobile tests affected by auth/sync instrumentation.
  - Run project/type/lint gates available for the mobile app.
  - If Supabase local tooling is available, apply or validate the migration locally.
- Standard local gate usage:
  - `./scripts/quality-fast.sh frontend`
- Test layers covered:
  - Type-level validation for helper and instrumentation.
  - Unit tests for helper sanitizer/default behaviour if existing test setup makes this straightforward.
  - Existing auth/sync tests as regression coverage.
  - Supabase migration validation if local Supabase workflow is available.
- Execution triggers:
  - `always` for type/lint/targeted tests touching auth/sync/logging.
  - `file-change-triggered` for migration validation.
- Slow-gate triggers:
  - `N/A` unless the repo’s quality policy requires a slow frontend gate for auth/sync runtime changes.
- Hosted/deployed smoke ownership:
  - Deferred unless this task is being deployed to hosted Supabase in the same session.
- CI/manual posture note:
  - If CI is absent or partial, record local command output and manual Supabase Dashboard / SQL Editor verification notes.
- Notes:
  - Do not overbuild test scaffolding for this task.
  - Prefer small, focused tests around `logEvent()` if feasible.

## Implementation notes

### Database migration

Create a Supabase migration in:

`supabase/migrations/`

Use a timestamped filename following the existing repo convention, for example:

`supabase/migrations/20260507120000_create_app_logs.sql`

Create table:

`public.app_logs`

Columns:

- `id uuid primary key default gen_random_uuid()`
- `created_at timestamptz not null default now()`
- `level text not null check (level in ('debug', 'info', 'warn', 'error'))`
- `source text not null check (source in ('app', 'backend', 'database', 'sync', 'auth'))`
- `event text not null`
- `message text null`
- `user_id uuid null`
- `app_version text null`
- `platform text null`
- `context jsonb null`

Enable RLS.

Add an INSERT-only policy for authenticated users.

Do not add client SELECT, UPDATE, or DELETE policies.

Add useful indexes:

- `created_at desc`
- `level, created_at desc`
- `event, created_at desc`
- `user_id, created_at desc`

Make the migration idempotent where practical:

- Use `CREATE TABLE IF NOT EXISTS`.
- Use `CREATE INDEX IF NOT EXISTS`.
- For policies, use a `DO` block that checks `pg_policies` before creating the policy, since `CREATE POLICY` does not support clean `IF NOT EXISTS`.

### Mobile logging helper

Create:

`apps/mobile/src/logging/logEvent.ts`

Optionally create:

`apps/mobile/src/logging/index.ts`

The helper must reuse the existing mobile Supabase client from:

`apps/mobile/src/auth/supabase.ts`

Use `getSupabaseMobileClient()`.

Important clarifications:

- `getSupabaseMobileClient()` is synchronous.
- It returns a Supabase client or `null`.
- It is not async and must not be awaited.
- Do not create a second mobile Supabase client.

Export:

`logEvent(params)`

Use these types:

```ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogSource = 'app' | 'backend' | 'database' | 'sync' | 'auth';

type LogEventParams = {
  level: LogLevel;
  source?: LogSource;
  event: string;
  message?: string;
  userId?: string | null;
  context?: Record<string, unknown>;
};
