# Supabase Local Runtime (M5 Baseline)

This folder is the backend root for M5 (`Supabase` local-first development and testing).

## Purpose (T-20260220-08)

- Provide a reproducible local backend runtime scaffold.
- Prove migration + reset/seed flow from a clean local state.
- Expose a health endpoint for explicit API-surface smoke checks.
- Establish backend-local smoke test and fixture conventions for follow-on M5 tasks.

## Prerequisites

- Docker-compatible container runtime (Docker Desktop verified in this repo session).
- `npx`/`npm` available (repo scripts use `npx supabase@2.76.15` by default).
- Optional: install Supabase CLI globally (`supabase`) if preferred, but repo scripts do not require it.

## Local environment configuration strategy

- Local script overrides (optional): `supabase/.env.local`
  - copy from `supabase/.env.local.example`
  - currently used for script-level config like `SUPABASE_CLI_VERSION`
- Local function env vars (optional): `supabase/functions/.env.local`
  - copy from `supabase/functions/.env.local.example`
  - used by `supabase functions serve --env-file ...`
- Hosted placeholders (no secrets committed): `supabase/.env.hosted`
  - copy from `supabase/.env.hosted.example`
  - detailed hosted env/deployment command path is owned by `T-20260220-09`

## One-command local startup path

Run from repo root:

```bash
./supabase/scripts/local-runtime-up.sh
```

What it does:

1. Starts the Supabase local stack (`supabase start` via pinned `npx`).
2. Starts the local Edge Function server for `health` (background process).
3. Waits until `GET /functions/v1/health` responds.

Stop the local runtime:

```bash
./supabase/scripts/local-runtime-down.sh
```

## Deterministic local reset/seed path

Run from repo root:

```bash
./supabase/scripts/reset-local.sh
```

This wraps `supabase db reset --local --yes` and applies:

- `supabase/migrations/*` (baseline schema/bootstrap)
- `supabase/seed.sql` (deterministic test fixtures)

## Local smoke checks

Health endpoint:

```bash
./supabase/scripts/smoke-health.sh
```

Seed fixture baseline (via local Supabase REST API):

```bash
./supabase/scripts/smoke-seed.sh
```

Combined fast backend-local check (current baseline for this task):

```bash
./supabase/scripts/test-fast.sh
```

Current coverage:

- local stack bring-up
- migrations + reset + seed
- DB lint (`supabase db lint --fail-on error`)
- Edge health endpoint smoke
- deterministic fixture seed smoke

## Fixture baseline (deterministic)

`supabase/seed.sql` seeds `public.dev_fixture_principals` with named fixtures used by follow-on ownership/authz tests:

- `anonymous`
- `user_a`
- `user_b`
- `service_role_helper` (optional helper fixture)

These are dev fixtures only and do **not** lock the final auth linkage design for M5 auth/sync tasks.

## Health endpoint note

The `health` Edge Function is a local runtime smoke surface only. It exists to validate:

- local stack reachability
- local Edge Function serving path
- deterministic endpoint smoke checks

It does **not** lock the final sync API surface choice for `T-20260220-11` (`Edge Functions` vs `PostgREST/RPC` mix).

## Follow-on testing layers (documented now, implemented incrementally)

- `DB` tests: `pgTAP` (`supabase test db`) for policies/functions/constraints
- `Edge` unit tests: add when Edge logic beyond simple health exists
- `Supabase-local` integration/contract tests: required for auth/RLS/API tasks
- hosted smoke validation: owned by `T-20260220-09` (manual by default until CI exists)
- cross-stack `E2E`: strategy only in M5; repo-root `e2e/` reserved for later implementation
