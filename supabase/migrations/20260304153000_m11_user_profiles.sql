create or replace function app_public.set_current_timestamp_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

create table if not exists app_public.user_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text check (username is null or length(btrim(username)) > 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

comment on table app_public.user_profiles is
  'Authenticated app profile rows keyed 1:1 to auth.users for M11 account management.';

grant select, insert, update on table app_public.user_profiles to authenticated;
grant select, insert, update, delete on table app_public.user_profiles to service_role;

drop trigger if exists user_profiles_set_updated_at on app_public.user_profiles;
create trigger user_profiles_set_updated_at
before update on app_public.user_profiles
for each row
execute function app_public.set_current_timestamp_updated_at();

alter table app_public.user_profiles enable row level security;

drop policy if exists user_profiles_owner_select on app_public.user_profiles;
create policy user_profiles_owner_select
on app_public.user_profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists user_profiles_owner_insert on app_public.user_profiles;
create policy user_profiles_owner_insert
on app_public.user_profiles
for insert
to authenticated
with check (id = auth.uid());

drop policy if exists user_profiles_owner_update on app_public.user_profiles;
create policy user_profiles_owner_update
on app_public.user_profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());
