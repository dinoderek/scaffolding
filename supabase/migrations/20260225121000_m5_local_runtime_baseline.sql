-- M5 local backend runtime bootstrap baseline.
-- Keep this minimal: prove migration/reset/seed + establish deterministic dev fixtures
-- without locking final auth linkage or sync domain schema design.

create extension if not exists pgcrypto with schema extensions;

create schema if not exists app_public;
comment on schema app_public is
  'Reserved for upcoming app-owned sync domain tables (M5 follow-on tasks).';

create table if not exists public.dev_fixture_principals (
  fixture_key text primary key,
  subject_uuid uuid not null unique,
  subject_kind text not null check (subject_kind in ('anonymous', 'user', 'service_role')),
  email text,
  description text not null,
  created_at timestamptz not null default timezone('utc', now())
);

comment on table public.dev_fixture_principals is
  'Deterministic local-only fixtures for Supabase-local auth/RLS/API contract tests.';

alter table public.dev_fixture_principals enable row level security;

drop policy if exists "dev_fixture_principals_local_read" on public.dev_fixture_principals;
create policy "dev_fixture_principals_local_read"
on public.dev_fixture_principals
for select
to anon, authenticated
using (true);

grant select on table public.dev_fixture_principals to anon, authenticated, service_role;

create table if not exists public.local_runtime_bootstrap_markers (
  marker text primary key,
  details text not null,
  inserted_at timestamptz not null default timezone('utc', now())
);

comment on table public.local_runtime_bootstrap_markers is
  'Seed/bootstrap markers used by local runtime smoke tests.';

grant select on table public.local_runtime_bootstrap_markers to anon, authenticated, service_role;
