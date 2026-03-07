-- M14 set-type sync projection patch:
-- ensure exercise_sets.set_type exists/validated and ingest projection applies set_type on upsert.

alter table app_public.exercise_sets
  add column if not exists set_type text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'exercise_sets_set_type_guard'
  ) then
    alter table app_public.exercise_sets
      add constraint exercise_sets_set_type_guard
      check (
        set_type is null
        or set_type in ('warm_up', 'rir_0', 'rir_1', 'rir_2')
      );
  end if;
end
$$;

create or replace function app_public.sync_apply_projection_event(
  p_owner_user_id uuid,
  p_entity_type text,
  p_entity_id text,
  p_event_type text,
  p_occurred_at_ms bigint,
  p_payload jsonb
)
returns void
language plpgsql
set search_path = app_public, public, extensions
as $$
declare
  v_row_count bigint;
  v_id text;
  v_name text;
  v_origin_scope_id text;
  v_origin_source_id text;
  v_gym_id text;
  v_status text;
  v_started_at_ms bigint;
  v_completed_at_ms bigint;
  v_duration_sec integer;
  v_deleted_at_ms bigint;
  v_created_at_ms bigint;
  v_updated_at_ms bigint;
  v_session_id text;
  v_session_exercise_id text;
  v_exercise_definition_id text;
  v_order_index integer;
  v_machine_name text;
  v_weight_value text;
  v_reps_value text;
  v_set_type text;
  v_normalized_name text;
  v_row_id text;
  v_muscle_group_id text;
  v_weight double precision;
  v_role text;
  v_exercise_tag_definition_id text;
begin
  if p_owner_user_id is null then
    raise exception 'owner_user_id is required' using errcode = '22023';
  end if;

  if jsonb_typeof(p_payload) <> 'object' then
    raise exception 'payload must be an object' using errcode = '22023';
  end if;

  case p_entity_type
    when 'gyms' then
      if not (p_payload ? 'id') then
        raise exception 'payload.id is required for gyms events' using errcode = '22023';
      end if;

      v_id := btrim(p_payload ->> 'id');
      if v_id = '' or v_id <> p_entity_id then
        raise exception 'payload.id must match entity_id for gyms events' using errcode = '22023';
      end if;

      if p_event_type = 'upsert' then
        v_name := p_payload ->> 'name';
        v_origin_scope_id := coalesce(p_payload ->> 'origin_scope_id', 'private');
        v_origin_source_id := coalesce(p_payload ->> 'origin_source_id', 'local');
        v_created_at_ms := (p_payload ->> 'created_at_ms')::bigint;
        v_updated_at_ms := (p_payload ->> 'updated_at_ms')::bigint;

        if length(btrim(v_name)) = 0 then
          raise exception 'payload.name is required for gyms upsert' using errcode = '22023';
        end if;

        if v_created_at_ms < 0 or v_updated_at_ms < 0 then
          raise exception 'created_at_ms and updated_at_ms must be >= 0' using errcode = '22023';
        end if;

        insert into app_public.gyms (
          id,
          owner_user_id,
          name,
          origin_scope_id,
          origin_source_id,
          deleted_at,
          created_at,
          updated_at
        )
        values (
          v_id,
          p_owner_user_id,
          v_name,
          v_origin_scope_id,
          v_origin_source_id,
          null,
          v_created_at_ms,
          v_updated_at_ms
        )
        on conflict (id)
        do update
          set name = excluded.name,
              origin_scope_id = excluded.origin_scope_id,
              origin_source_id = excluded.origin_source_id,
              deleted_at = null,
              created_at = least(app_public.gyms.created_at, excluded.created_at),
              updated_at = greatest(app_public.gyms.updated_at, excluded.updated_at)
          where app_public.gyms.owner_user_id = p_owner_user_id;

        get diagnostics v_row_count = row_count;
        if v_row_count = 0 then
          raise exception 'gyms id % belongs to a different owner', v_id using errcode = '42501';
        end if;
      elsif p_event_type = 'delete' then
        v_deleted_at_ms := coalesce((p_payload ->> 'deleted_at_ms')::bigint, p_occurred_at_ms);
        v_updated_at_ms := coalesce((p_payload ->> 'updated_at_ms')::bigint, v_deleted_at_ms);

        update app_public.gyms
          set deleted_at = v_deleted_at_ms,
              updated_at = greatest(updated_at, v_updated_at_ms)
          where id = v_id
            and owner_user_id = p_owner_user_id;

        get diagnostics v_row_count = row_count;
        if v_row_count = 0 then
          raise exception 'cannot delete missing gym %', v_id using errcode = 'P0002';
        end if;
      else
        raise exception 'unsupported gyms event_type: %', p_event_type using errcode = '22023';
      end if;

    when 'sessions' then
      if not (p_payload ? 'id') then
        raise exception 'payload.id is required for sessions events' using errcode = '22023';
      end if;

      v_id := btrim(p_payload ->> 'id');
      if v_id = '' or v_id <> p_entity_id then
        raise exception 'payload.id must match entity_id for sessions events' using errcode = '22023';
      end if;

      if p_event_type = 'upsert' then
        v_gym_id := nullif(btrim(coalesce(p_payload ->> 'gym_id', '')), '');
        v_status := p_payload ->> 'status';
        v_started_at_ms := (p_payload ->> 'started_at_ms')::bigint;
        v_completed_at_ms := (p_payload ->> 'completed_at_ms')::bigint;
        v_duration_sec := (p_payload ->> 'duration_sec')::integer;
        v_deleted_at_ms := (p_payload ->> 'deleted_at_ms')::bigint;
        v_created_at_ms := (p_payload ->> 'created_at_ms')::bigint;
        v_updated_at_ms := (p_payload ->> 'updated_at_ms')::bigint;

        if v_status not in ('draft', 'active', 'completed') then
          raise exception 'payload.status must be draft|active|completed for sessions upsert' using errcode = '22023';
        end if;

        if v_started_at_ms < 0 or coalesce(v_completed_at_ms, 0) < 0 or coalesce(v_deleted_at_ms, 0) < 0 then
          raise exception 'session timestamps must be >= 0' using errcode = '22023';
        end if;

        if v_created_at_ms < 0 or v_updated_at_ms < 0 then
          raise exception 'created_at_ms and updated_at_ms must be >= 0' using errcode = '22023';
        end if;

        if v_duration_sec is not null and v_duration_sec < 0 then
          raise exception 'duration_sec must be >= 0' using errcode = '22023';
        end if;

        insert into app_public.sessions (
          id,
          owner_user_id,
          gym_id,
          status,
          started_at,
          completed_at,
          duration_sec,
          deleted_at,
          created_at,
          updated_at
        )
        values (
          v_id,
          p_owner_user_id,
          v_gym_id,
          v_status,
          v_started_at_ms,
          v_completed_at_ms,
          v_duration_sec,
          v_deleted_at_ms,
          v_created_at_ms,
          v_updated_at_ms
        )
        on conflict (id)
        do update
          set gym_id = excluded.gym_id,
              status = excluded.status,
              started_at = excluded.started_at,
              completed_at = excluded.completed_at,
              duration_sec = excluded.duration_sec,
              deleted_at = excluded.deleted_at,
              created_at = least(app_public.sessions.created_at, excluded.created_at),
              updated_at = greatest(app_public.sessions.updated_at, excluded.updated_at)
          where app_public.sessions.owner_user_id = p_owner_user_id;

        get diagnostics v_row_count = row_count;
        if v_row_count = 0 then
          raise exception 'sessions id % belongs to a different owner', v_id using errcode = '42501';
        end if;
      elsif p_event_type = 'delete' then
        v_deleted_at_ms := coalesce((p_payload ->> 'deleted_at_ms')::bigint, p_occurred_at_ms);
        v_updated_at_ms := coalesce((p_payload ->> 'updated_at_ms')::bigint, v_deleted_at_ms);

        update app_public.sessions
          set deleted_at = v_deleted_at_ms,
              updated_at = greatest(updated_at, v_updated_at_ms)
          where id = v_id
            and owner_user_id = p_owner_user_id;

        get diagnostics v_row_count = row_count;
        if v_row_count = 0 then
          raise exception 'cannot delete missing session %', v_id using errcode = 'P0002';
        end if;
      elsif p_event_type = 'complete' then
        v_completed_at_ms := (p_payload ->> 'completed_at_ms')::bigint;
        v_duration_sec := (p_payload ->> 'duration_sec')::integer;
        v_updated_at_ms := (p_payload ->> 'updated_at_ms')::bigint;

        if v_completed_at_ms < 0 or v_duration_sec < 0 or v_updated_at_ms < 0 then
          raise exception 'completed_at_ms, duration_sec, and updated_at_ms must be >= 0' using errcode = '22023';
        end if;

        update app_public.sessions
          set status = 'completed',
              completed_at = v_completed_at_ms,
              duration_sec = v_duration_sec,
              updated_at = greatest(updated_at, v_updated_at_ms)
          where id = v_id
            and owner_user_id = p_owner_user_id;

        get diagnostics v_row_count = row_count;
        if v_row_count = 0 then
          raise exception 'cannot complete missing session %', v_id using errcode = 'P0002';
        end if;
      else
        raise exception 'unsupported sessions event_type: %', p_event_type using errcode = '22023';
      end if;

    when 'session_exercises' then
      if not (p_payload ? 'id') and p_event_type <> 'reorder' then
        raise exception 'payload.id is required for session_exercises events' using errcode = '22023';
      end if;

      if p_event_type = 'upsert' then
        v_id := btrim(p_payload ->> 'id');
        if v_id = '' or v_id <> p_entity_id then
          raise exception 'payload.id must match entity_id for session_exercises upsert' using errcode = '22023';
        end if;

        v_session_id := btrim(p_payload ->> 'session_id');
        v_exercise_definition_id := btrim(p_payload ->> 'exercise_definition_id');
        v_order_index := (p_payload ->> 'order_index')::integer;
        v_name := p_payload ->> 'name';
        v_machine_name := p_payload ->> 'machine_name';
        v_origin_scope_id := coalesce(p_payload ->> 'origin_scope_id', 'private');
        v_origin_source_id := coalesce(p_payload ->> 'origin_source_id', 'local');
        v_created_at_ms := (p_payload ->> 'created_at_ms')::bigint;
        v_updated_at_ms := (p_payload ->> 'updated_at_ms')::bigint;

        if v_session_id = '' or v_exercise_definition_id = '' then
          raise exception 'session_id and exercise_definition_id are required for session_exercises upsert' using errcode = '22023';
        end if;

        if length(btrim(v_name)) = 0 then
          raise exception 'payload.name is required for session_exercises upsert' using errcode = '22023';
        end if;

        if v_order_index < 0 or v_created_at_ms < 0 or v_updated_at_ms < 0 then
          raise exception 'order_index, created_at_ms, and updated_at_ms must be >= 0' using errcode = '22023';
        end if;

        update app_public.session_exercises
          set deleted_at = coalesce(deleted_at, v_updated_at_ms),
              updated_at = greatest(updated_at, v_updated_at_ms)
          where owner_user_id = p_owner_user_id
            and session_id = v_session_id
            and order_index = v_order_index
            and id <> v_id
            and deleted_at is null;

        insert into app_public.session_exercises (
          id,
          owner_user_id,
          session_id,
          exercise_definition_id,
          order_index,
          name,
          machine_name,
          origin_scope_id,
          origin_source_id,
          deleted_at,
          created_at,
          updated_at
        )
        values (
          v_id,
          p_owner_user_id,
          v_session_id,
          v_exercise_definition_id,
          v_order_index,
          v_name,
          nullif(v_machine_name, ''),
          v_origin_scope_id,
          v_origin_source_id,
          null,
          v_created_at_ms,
          v_updated_at_ms
        )
        on conflict (id)
        do update
          set session_id = excluded.session_id,
              exercise_definition_id = excluded.exercise_definition_id,
              order_index = excluded.order_index,
              name = excluded.name,
              machine_name = excluded.machine_name,
              origin_scope_id = excluded.origin_scope_id,
              origin_source_id = excluded.origin_source_id,
              deleted_at = null,
              created_at = least(app_public.session_exercises.created_at, excluded.created_at),
              updated_at = greatest(app_public.session_exercises.updated_at, excluded.updated_at)
          where app_public.session_exercises.owner_user_id = p_owner_user_id;

        get diagnostics v_row_count = row_count;
        if v_row_count = 0 then
          raise exception 'session_exercises id % belongs to a different owner', v_id using errcode = '42501';
        end if;
      elsif p_event_type = 'delete' then
        v_id := btrim(p_payload ->> 'id');
        if v_id = '' or v_id <> p_entity_id then
          raise exception 'payload.id must match entity_id for session_exercises delete' using errcode = '22023';
        end if;

        v_deleted_at_ms := coalesce((p_payload ->> 'deleted_at_ms')::bigint, p_occurred_at_ms);
        v_updated_at_ms := coalesce((p_payload ->> 'updated_at_ms')::bigint, v_deleted_at_ms);

        update app_public.session_exercises
          set deleted_at = v_deleted_at_ms,
              updated_at = greatest(updated_at, v_updated_at_ms)
          where id = v_id
            and owner_user_id = p_owner_user_id;

        get diagnostics v_row_count = row_count;
        if v_row_count = 0 then
          raise exception 'cannot delete missing session_exercise %', v_id using errcode = 'P0002';
        end if;
      elsif p_event_type = 'reorder' then
        v_id := p_entity_id;
        v_session_id := btrim(p_payload ->> 'session_id');
        v_order_index := (p_payload ->> 'order_index')::integer;
        v_updated_at_ms := coalesce((p_payload ->> 'updated_at_ms')::bigint, p_occurred_at_ms);

        if v_id = '' or v_session_id = '' then
          raise exception 'entity_id and payload.session_id are required for session_exercises reorder' using errcode = '22023';
        end if;

        if v_order_index < 0 or v_updated_at_ms < 0 then
          raise exception 'order_index and updated_at_ms must be >= 0' using errcode = '22023';
        end if;

        update app_public.session_exercises
          set deleted_at = coalesce(deleted_at, v_updated_at_ms),
              updated_at = greatest(updated_at, v_updated_at_ms)
          where owner_user_id = p_owner_user_id
            and session_id = v_session_id
            and order_index = v_order_index
            and id <> v_id
            and deleted_at is null;

        update app_public.session_exercises
          set session_id = v_session_id,
              order_index = v_order_index,
              deleted_at = null,
              updated_at = greatest(updated_at, v_updated_at_ms)
          where id = v_id
            and owner_user_id = p_owner_user_id;

        get diagnostics v_row_count = row_count;
        if v_row_count = 0 then
          raise exception 'cannot reorder missing session_exercise %', v_id using errcode = 'P0002';
        end if;
      else
        raise exception 'unsupported session_exercises event_type: %', p_event_type using errcode = '22023';
      end if;

    when 'exercise_sets' then
      if not (p_payload ? 'id') and p_event_type <> 'reorder' then
        raise exception 'payload.id is required for exercise_sets events' using errcode = '22023';
      end if;

      if p_event_type = 'upsert' then
        v_id := btrim(p_payload ->> 'id');
        if v_id = '' or v_id <> p_entity_id then
          raise exception 'payload.id must match entity_id for exercise_sets upsert' using errcode = '22023';
        end if;

        v_session_exercise_id := btrim(p_payload ->> 'session_exercise_id');
        v_order_index := (p_payload ->> 'order_index')::integer;
        v_weight_value := coalesce(p_payload ->> 'weight_value', '');
        v_reps_value := coalesce(p_payload ->> 'reps_value', '');
        v_set_type := nullif(btrim(coalesce(p_payload ->> 'set_type', '')), '');
        v_created_at_ms := (p_payload ->> 'created_at_ms')::bigint;
        v_updated_at_ms := (p_payload ->> 'updated_at_ms')::bigint;

        if v_session_exercise_id = '' then
          raise exception 'payload.session_exercise_id is required for exercise_sets upsert' using errcode = '22023';
        end if;

        if v_order_index < 0 or v_created_at_ms < 0 or v_updated_at_ms < 0 then
          raise exception 'order_index, created_at_ms, and updated_at_ms must be >= 0' using errcode = '22023';
        end if;

        if v_set_type is not null and v_set_type not in ('warm_up', 'rir_0', 'rir_1', 'rir_2') then
          raise exception 'payload.set_type must be warm_up|rir_0|rir_1|rir_2|null for exercise_sets upsert' using errcode = '22023';
        end if;

        update app_public.exercise_sets
          set deleted_at = coalesce(deleted_at, v_updated_at_ms),
              updated_at = greatest(updated_at, v_updated_at_ms)
          where owner_user_id = p_owner_user_id
            and session_exercise_id = v_session_exercise_id
            and order_index = v_order_index
            and id <> v_id
            and deleted_at is null;

        insert into app_public.exercise_sets (
          id,
          owner_user_id,
          session_exercise_id,
          order_index,
          weight_value,
          reps_value,
          set_type,
          deleted_at,
          created_at,
          updated_at
        )
        values (
          v_id,
          p_owner_user_id,
          v_session_exercise_id,
          v_order_index,
          v_weight_value,
          v_reps_value,
          v_set_type,
          null,
          v_created_at_ms,
          v_updated_at_ms
        )
        on conflict (id)
        do update
          set session_exercise_id = excluded.session_exercise_id,
              order_index = excluded.order_index,
              weight_value = excluded.weight_value,
              reps_value = excluded.reps_value,
              set_type = excluded.set_type,
              deleted_at = null,
              created_at = least(app_public.exercise_sets.created_at, excluded.created_at),
              updated_at = greatest(app_public.exercise_sets.updated_at, excluded.updated_at)
          where app_public.exercise_sets.owner_user_id = p_owner_user_id;

        get diagnostics v_row_count = row_count;
        if v_row_count = 0 then
          raise exception 'exercise_sets id % belongs to a different owner', v_id using errcode = '42501';
        end if;
      elsif p_event_type = 'delete' then
        v_id := btrim(p_payload ->> 'id');
        if v_id = '' or v_id <> p_entity_id then
          raise exception 'payload.id must match entity_id for exercise_sets delete' using errcode = '22023';
        end if;

        v_deleted_at_ms := coalesce((p_payload ->> 'deleted_at_ms')::bigint, p_occurred_at_ms);
        v_updated_at_ms := coalesce((p_payload ->> 'updated_at_ms')::bigint, v_deleted_at_ms);

        update app_public.exercise_sets
          set deleted_at = v_deleted_at_ms,
              updated_at = greatest(updated_at, v_updated_at_ms)
          where id = v_id
            and owner_user_id = p_owner_user_id;

        get diagnostics v_row_count = row_count;
        if v_row_count = 0 then
          raise exception 'cannot delete missing exercise_set %', v_id using errcode = 'P0002';
        end if;
      elsif p_event_type = 'reorder' then
        v_id := p_entity_id;
        v_session_exercise_id := btrim(p_payload ->> 'session_exercise_id');
        v_order_index := (p_payload ->> 'order_index')::integer;
        v_updated_at_ms := coalesce((p_payload ->> 'updated_at_ms')::bigint, p_occurred_at_ms);

        if v_id = '' or v_session_exercise_id = '' then
          raise exception 'entity_id and payload.session_exercise_id are required for exercise_sets reorder' using errcode = '22023';
        end if;

        if v_order_index < 0 or v_updated_at_ms < 0 then
          raise exception 'order_index and updated_at_ms must be >= 0' using errcode = '22023';
        end if;

        update app_public.exercise_sets
          set deleted_at = coalesce(deleted_at, v_updated_at_ms),
              updated_at = greatest(updated_at, v_updated_at_ms)
          where owner_user_id = p_owner_user_id
            and session_exercise_id = v_session_exercise_id
            and order_index = v_order_index
            and id <> v_id
            and deleted_at is null;

        update app_public.exercise_sets
          set session_exercise_id = v_session_exercise_id,
              order_index = v_order_index,
              deleted_at = null,
              updated_at = greatest(updated_at, v_updated_at_ms)
          where id = v_id
            and owner_user_id = p_owner_user_id;

        get diagnostics v_row_count = row_count;
        if v_row_count = 0 then
          raise exception 'cannot reorder missing exercise_set %', v_id using errcode = 'P0002';
        end if;
      else
        raise exception 'unsupported exercise_sets event_type: %', p_event_type using errcode = '22023';
      end if;

    when 'exercise_definitions' then
      if not (p_payload ? 'id') then
        raise exception 'payload.id is required for exercise_definitions events' using errcode = '22023';
      end if;

      v_id := btrim(p_payload ->> 'id');
      if v_id = '' or v_id <> p_entity_id then
        raise exception 'payload.id must match entity_id for exercise_definitions events' using errcode = '22023';
      end if;

      if p_event_type = 'upsert' then
        v_name := p_payload ->> 'name';
        v_deleted_at_ms := (p_payload ->> 'deleted_at_ms')::bigint;
        v_created_at_ms := (p_payload ->> 'created_at_ms')::bigint;
        v_updated_at_ms := (p_payload ->> 'updated_at_ms')::bigint;

        if length(btrim(v_name)) = 0 then
          raise exception 'payload.name is required for exercise_definitions upsert' using errcode = '22023';
        end if;

        if v_created_at_ms < 0 or v_updated_at_ms < 0 or coalesce(v_deleted_at_ms, 0) < 0 then
          raise exception 'exercise_definitions timestamps must be >= 0' using errcode = '22023';
        end if;

        insert into app_public.exercise_definitions (
          id,
          owner_user_id,
          name,
          deleted_at,
          created_at,
          updated_at
        )
        values (
          v_id,
          p_owner_user_id,
          v_name,
          v_deleted_at_ms,
          v_created_at_ms,
          v_updated_at_ms
        )
        on conflict (id)
        do update
          set name = excluded.name,
              deleted_at = excluded.deleted_at,
              created_at = least(app_public.exercise_definitions.created_at, excluded.created_at),
              updated_at = greatest(app_public.exercise_definitions.updated_at, excluded.updated_at)
          where app_public.exercise_definitions.owner_user_id = p_owner_user_id;

        get diagnostics v_row_count = row_count;
        if v_row_count = 0 then
          raise exception 'exercise_definitions id % belongs to a different owner', v_id using errcode = '42501';
        end if;
      elsif p_event_type = 'delete' then
        v_deleted_at_ms := coalesce((p_payload ->> 'deleted_at_ms')::bigint, p_occurred_at_ms);
        v_updated_at_ms := coalesce((p_payload ->> 'updated_at_ms')::bigint, v_deleted_at_ms);

        update app_public.exercise_definitions
          set deleted_at = v_deleted_at_ms,
              updated_at = greatest(updated_at, v_updated_at_ms)
          where id = v_id
            and owner_user_id = p_owner_user_id;

        get diagnostics v_row_count = row_count;
        if v_row_count = 0 then
          raise exception 'cannot delete missing exercise_definition %', v_id using errcode = 'P0002';
        end if;
      else
        raise exception 'unsupported exercise_definitions event_type: %', p_event_type using errcode = '22023';
      end if;

    when 'exercise_muscle_mappings' then
      if p_event_type = 'attach' then
        v_row_id := btrim(p_payload ->> 'row_id');
        v_exercise_definition_id := btrim(p_payload ->> 'exercise_definition_id');
        v_muscle_group_id := btrim(p_payload ->> 'muscle_group_id');
        v_weight := (p_payload ->> 'weight')::double precision;
        v_role := p_payload ->> 'role';
        v_created_at_ms := (p_payload ->> 'created_at_ms')::bigint;
        v_updated_at_ms := (p_payload ->> 'updated_at_ms')::bigint;

        if v_row_id = '' or v_exercise_definition_id = '' or v_muscle_group_id = '' then
          raise exception 'row_id, exercise_definition_id, and muscle_group_id are required for exercise_muscle_mappings attach' using errcode = '22023';
        end if;

        if v_weight <= 0 then
          raise exception 'payload.weight must be > 0 for exercise_muscle_mappings attach' using errcode = '22023';
        end if;

        if v_role is not null and v_role not in ('primary', 'secondary', 'stabilizer') then
          raise exception 'payload.role must be primary|secondary|stabilizer|null for exercise_muscle_mappings attach' using errcode = '22023';
        end if;

        if v_created_at_ms < 0 or v_updated_at_ms < 0 then
          raise exception 'created_at_ms and updated_at_ms must be >= 0' using errcode = '22023';
        end if;

        delete from app_public.exercise_muscle_mappings
          where owner_user_id = p_owner_user_id
            and (
              id = v_row_id
              or (
                exercise_definition_id = v_exercise_definition_id
                and muscle_group_id = v_muscle_group_id
              )
            );

        insert into app_public.exercise_muscle_mappings (
          id,
          owner_user_id,
          exercise_definition_id,
          muscle_group_id,
          weight,
          role,
          created_at,
          updated_at
        )
        values (
          v_row_id,
          p_owner_user_id,
          v_exercise_definition_id,
          v_muscle_group_id,
          v_weight,
          v_role,
          v_created_at_ms,
          v_updated_at_ms
        );
      elsif p_event_type = 'detach' then
        v_exercise_definition_id := btrim(p_payload ->> 'exercise_definition_id');
        v_muscle_group_id := btrim(p_payload ->> 'muscle_group_id');

        if v_exercise_definition_id = '' or v_muscle_group_id = '' then
          raise exception 'exercise_definition_id and muscle_group_id are required for exercise_muscle_mappings detach' using errcode = '22023';
        end if;

        delete from app_public.exercise_muscle_mappings
          where owner_user_id = p_owner_user_id
            and exercise_definition_id = v_exercise_definition_id
            and muscle_group_id = v_muscle_group_id;
      else
        raise exception 'unsupported exercise_muscle_mappings event_type: %', p_event_type using errcode = '22023';
      end if;

    when 'exercise_tag_definitions' then
      if not (p_payload ? 'id') then
        raise exception 'payload.id is required for exercise_tag_definitions events' using errcode = '22023';
      end if;

      v_id := btrim(p_payload ->> 'id');
      if v_id = '' or v_id <> p_entity_id then
        raise exception 'payload.id must match entity_id for exercise_tag_definitions events' using errcode = '22023';
      end if;

      if p_event_type = 'upsert' then
        v_exercise_definition_id := btrim(p_payload ->> 'exercise_definition_id');
        v_name := p_payload ->> 'name';
        v_normalized_name := p_payload ->> 'normalized_name';
        v_deleted_at_ms := (p_payload ->> 'deleted_at_ms')::bigint;
        v_created_at_ms := (p_payload ->> 'created_at_ms')::bigint;
        v_updated_at_ms := (p_payload ->> 'updated_at_ms')::bigint;

        if v_exercise_definition_id = '' then
          raise exception 'payload.exercise_definition_id is required for exercise_tag_definitions upsert' using errcode = '22023';
        end if;

        if length(btrim(v_name)) = 0 or length(btrim(v_normalized_name)) = 0 then
          raise exception 'payload.name and payload.normalized_name are required for exercise_tag_definitions upsert' using errcode = '22023';
        end if;

        if v_created_at_ms < 0 or v_updated_at_ms < 0 or coalesce(v_deleted_at_ms, 0) < 0 then
          raise exception 'exercise_tag_definitions timestamps must be >= 0' using errcode = '22023';
        end if;

        insert into app_public.exercise_tag_definitions (
          id,
          owner_user_id,
          exercise_definition_id,
          name,
          normalized_name,
          deleted_at,
          created_at,
          updated_at
        )
        values (
          v_id,
          p_owner_user_id,
          v_exercise_definition_id,
          v_name,
          v_normalized_name,
          v_deleted_at_ms,
          v_created_at_ms,
          v_updated_at_ms
        )
        on conflict (id)
        do update
          set exercise_definition_id = excluded.exercise_definition_id,
              name = excluded.name,
              normalized_name = excluded.normalized_name,
              deleted_at = excluded.deleted_at,
              created_at = least(app_public.exercise_tag_definitions.created_at, excluded.created_at),
              updated_at = greatest(app_public.exercise_tag_definitions.updated_at, excluded.updated_at)
          where app_public.exercise_tag_definitions.owner_user_id = p_owner_user_id;

        get diagnostics v_row_count = row_count;
        if v_row_count = 0 then
          raise exception 'exercise_tag_definitions id % belongs to a different owner', v_id using errcode = '42501';
        end if;
      elsif p_event_type = 'delete' then
        v_deleted_at_ms := coalesce((p_payload ->> 'deleted_at_ms')::bigint, p_occurred_at_ms);
        v_updated_at_ms := coalesce((p_payload ->> 'updated_at_ms')::bigint, v_deleted_at_ms);

        update app_public.exercise_tag_definitions
          set deleted_at = v_deleted_at_ms,
              updated_at = greatest(updated_at, v_updated_at_ms)
          where id = v_id
            and owner_user_id = p_owner_user_id;

        get diagnostics v_row_count = row_count;
        if v_row_count = 0 then
          raise exception 'cannot delete missing exercise_tag_definition %', v_id using errcode = 'P0002';
        end if;
      else
        raise exception 'unsupported exercise_tag_definitions event_type: %', p_event_type using errcode = '22023';
      end if;

    when 'session_exercise_tags' then
      if p_event_type = 'attach' then
        v_row_id := btrim(p_payload ->> 'row_id');
        v_session_exercise_id := btrim(p_payload ->> 'session_exercise_id');
        v_exercise_tag_definition_id := btrim(p_payload ->> 'exercise_tag_definition_id');
        v_created_at_ms := (p_payload ->> 'created_at_ms')::bigint;

        if v_row_id = '' or v_session_exercise_id = '' or v_exercise_tag_definition_id = '' then
          raise exception 'row_id, session_exercise_id, and exercise_tag_definition_id are required for session_exercise_tags attach' using errcode = '22023';
        end if;

        if v_created_at_ms < 0 then
          raise exception 'payload.created_at_ms must be >= 0 for session_exercise_tags attach' using errcode = '22023';
        end if;

        delete from app_public.session_exercise_tags
          where owner_user_id = p_owner_user_id
            and (
              id = v_row_id
              or (
                session_exercise_id = v_session_exercise_id
                and exercise_tag_definition_id = v_exercise_tag_definition_id
              )
            );

        insert into app_public.session_exercise_tags (
          id,
          owner_user_id,
          session_exercise_id,
          exercise_tag_definition_id,
          created_at
        )
        values (
          v_row_id,
          p_owner_user_id,
          v_session_exercise_id,
          v_exercise_tag_definition_id,
          v_created_at_ms
        );
      elsif p_event_type = 'detach' then
        v_session_exercise_id := btrim(p_payload ->> 'session_exercise_id');
        v_exercise_tag_definition_id := btrim(p_payload ->> 'exercise_tag_definition_id');

        if v_session_exercise_id = '' or v_exercise_tag_definition_id = '' then
          raise exception 'session_exercise_id and exercise_tag_definition_id are required for session_exercise_tags detach' using errcode = '22023';
        end if;

        delete from app_public.session_exercise_tags
          where owner_user_id = p_owner_user_id
            and session_exercise_id = v_session_exercise_id
            and exercise_tag_definition_id = v_exercise_tag_definition_id;
      else
        raise exception 'unsupported session_exercise_tags event_type: %', p_event_type using errcode = '22023';
      end if;

    else
      raise exception 'unsupported entity_type: %', p_entity_type using errcode = '22023';
  end case;
end;
$$;
