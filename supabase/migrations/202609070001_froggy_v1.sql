-- New, dedicated Froggy project. Review before applying; never run against an unrelated app.
begin;
create table public.game_admins (uid uuid primary key references auth.users(id) on delete cascade);
create table public.profiles (uid uuid primary key references auth.users(id) on delete cascade, preferences jsonb not null default '{}'::jsonb);
create table public.levels (id text primary key, data jsonb not null, check (data->>'status' in ('draft','published')));
create table public.level_frogs (level_id text primary key references public.levels(id) on delete cascade, markers jsonb not null default '[]', check(jsonb_typeof(markers) = 'array'));
create table public.user_progress (uid uuid not null references auth.users(id) on delete cascade, level_id text not null references public.levels(id), data jsonb not null, primary key(uid,level_id));
create table public.level_attempts (uid uuid not null references auth.users(id) on delete cascade, run_id text not null, level_id text not null references public.levels(id), data jsonb not null, primary key(uid,run_id));

alter table public.game_admins enable row level security;
alter table public.profiles enable row level security;
alter table public.levels enable row level security;
alter table public.level_frogs enable row level security;
alter table public.user_progress enable row level security;
alter table public.level_attempts enable row level security;
revoke all on public.game_admins, public.profiles, public.levels, public.level_frogs, public.user_progress, public.level_attempts from anon, authenticated;
grant select on public.game_admins, public.user_progress, public.level_attempts to authenticated;
grant select, insert, update on public.profiles, public.levels, public.level_frogs to authenticated;

create function public.is_froggy_admin() returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.game_admins where uid = auth.uid());
$$;
revoke all on function public.is_froggy_admin() from public, anon;
grant execute on function public.is_froggy_admin() to authenticated;
create policy admin_self_read on public.game_admins for select to authenticated using (uid = auth.uid());
create policy profile_read on public.profiles for select to authenticated using (uid = auth.uid());
create policy profile_insert on public.profiles for insert to authenticated with check (uid = auth.uid());
create policy profile_update on public.profiles for update to authenticated using (uid = auth.uid()) with check (uid = auth.uid());
create policy level_read on public.levels for select to authenticated using (
  public.is_froggy_admin() or (data->>'status' = 'published' and coalesce((data->>'publishAt')::numeric, 0) <= extract(epoch from now()) * 1000)
);
create policy level_insert on public.levels for insert to authenticated with check (public.is_froggy_admin());
create policy level_update on public.levels for update to authenticated using (public.is_froggy_admin()) with check (public.is_froggy_admin());
create policy frogs_read on public.level_frogs for select to authenticated using (exists(select 1 from public.levels l where l.id = level_id));
create policy frogs_insert on public.level_frogs for insert to authenticated with check (public.is_froggy_admin());
create policy frogs_update on public.level_frogs for update to authenticated using (public.is_froggy_admin()) with check (public.is_froggy_admin());
create policy progress_read on public.user_progress for select to authenticated using (uid = auth.uid());
create policy attempts_read on public.level_attempts for select to authenticated using (uid = auth.uid());

-- Transactional, idempotent completion. XP is awarded once per level, not per replay.
-- Hit locations and elapsed time still originate in the casual-game client: not ranked anti-cheat.
create function public.save_game_run(p_level_id text, p_run jsonb) returns void language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid(); v_now numeric := floor(extract(epoch from now()) * 1000);
  v_level jsonb; v_markers jsonb; v_old jsonb; v_next jsonb;
  v_duration numeric; v_clicks int; v_misses int; v_hints int; v_found int; v_complete boolean; v_xp int; v_best numeric;
begin
  if v_uid is null then raise exception 'Sign in required'; end if;
  if jsonb_typeof(p_run) is distinct from 'object' or not (p_run ?& array['id','startedAt','durationMs','clicks','misses','hintsUsed','foundFroggys','completed']) then raise exception 'Incomplete run'; end if;
  if jsonb_typeof(p_run->'foundFroggys') is distinct from 'array' or jsonb_typeof(p_run->'completed') is distinct from 'boolean'
     or jsonb_typeof(p_run->'durationMs') is distinct from 'number' or jsonb_typeof(p_run->'startedAt') is distinct from 'number'
     or jsonb_typeof(p_run->'clicks') is distinct from 'number' or jsonb_typeof(p_run->'misses') is distinct from 'number'
     or jsonb_typeof(p_run->'hintsUsed') is distinct from 'number' then raise exception 'Invalid run types'; end if;
  if coalesce(length(p_run->>'id'),0) not between 1 and 100 then raise exception 'Invalid run ID'; end if;
  select data into v_level from public.levels where id = p_level_id;
  if v_level is null or v_level->>'status' <> 'published' or coalesce((v_level->>'publishAt')::numeric,0) > v_now then raise exception 'Level unavailable'; end if;
  select markers into v_markers from public.level_frogs where level_id = p_level_id;
  if v_markers is null or jsonb_array_length(v_markers) = 0 then raise exception 'Level has no frogs'; end if;
  v_duration := (p_run->>'durationMs')::numeric; v_clicks := (p_run->>'clicks')::int;
  v_misses := (p_run->>'misses')::int; v_hints := (p_run->>'hintsUsed')::int;
  v_complete := (p_run->>'completed')::boolean; v_found := jsonb_array_length(p_run->'foundFroggys');
  if v_duration < 0 or v_duration > 604800000 or (p_run->>'startedAt')::numeric <= 0 or (p_run->>'startedAt')::numeric > v_now + 10000
     or v_duration > v_now - (p_run->>'startedAt')::numeric + 10000
     or v_clicks < 0 or v_clicks > 1000000 or v_misses < 0 or v_misses > v_clicks or v_hints not between 0 and 3 or v_clicks - v_misses <> v_found then raise exception 'Invalid counters'; end if;
  if v_found <> (select count(distinct value) from jsonb_array_elements_text(p_run->'foundFroggys'))
     or exists(select 1 from jsonb_array_elements_text(p_run->'foundFroggys') f(value) where not exists(select 1 from jsonb_array_elements(v_markers) m where m->>'id' = f.value)) then raise exception 'Invalid frogs'; end if;
  if v_complete and v_found <> jsonb_array_length(v_markers) then raise exception 'Incomplete level'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_uid::text || ':' || p_level_id, 0));
  if exists(select 1 from public.level_attempts where uid=v_uid and run_id=p_run->>'id') then return; end if;
  select data into v_old from public.user_progress where uid=v_uid and level_id=p_level_id for update;
  v_old := coalesce(v_old, jsonb_build_object('uid',v_uid,'levelId',p_level_id,'startedAt',(p_run->>'startedAt')::numeric,'completedAt',null,'durationMs',null,'clicks',0,'misses',0,'foundFroggys','[]'::jsonb,'completed',false));
  if v_complete then
    v_xp := coalesce((v_old->>'xp')::int, case when (v_old->>'completed')::boolean then 100 else 100 + greatest(0,60-floor(v_duration/1000)::int) + greatest(0,30-v_misses*5) + case when v_hints=0 then 20 else 0 end end);
    v_best := coalesce((v_old->>'bestDurationMs')::numeric, case when (v_old->>'completed')::boolean then (v_old->>'durationMs')::numeric else null end);
    v_next := v_old || p_run || jsonb_build_object('uid',v_uid,'levelId',p_level_id,'completedAt',v_now,'bestDurationMs',least(coalesce(v_best,v_duration),v_duration),'xp',v_xp,'attempts',coalesce((v_old->>'attempts')::int,0)+1,'lastAttemptId',p_run->>'id','activeAttempt',null);
    insert into public.level_attempts(uid,run_id,level_id,data) values(v_uid,p_run->>'id',p_level_id,p_run);
  else
    if v_old->'activeAttempt'->>'id' = p_run->>'id' and (v_old->'activeAttempt'->>'durationMs')::numeric > v_duration then return; end if;
    v_next := v_old || jsonb_build_object('activeAttempt',p_run);
  end if;
  insert into public.user_progress(uid,level_id,data) values(v_uid,p_level_id,v_next) on conflict(uid,level_id) do update set data=excluded.data;
end;
$$;
revoke all on function public.save_game_run(text,jsonb) from public, anon;
grant execute on function public.save_game_run(text,jsonb) to authenticated;

-- Images are public media with unguessable object filenames; uploads are admin-only.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values ('level-images','level-images',true,12582912,array['image/jpeg','image/png','image/webp']);
create policy level_image_upload on storage.objects for insert to authenticated with check(bucket_id='level-images' and public.is_froggy_admin());
commit;
