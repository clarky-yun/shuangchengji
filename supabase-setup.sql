create table if not exists public.couple_app_state (
  space_id text primary key,
  access_code text not null,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.couple_app_state enable row level security;
revoke all on public.couple_app_state from anon, authenticated;

create or replace function public.get_couple_state(
  p_space_id text,
  p_access_code text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  select payload
    into result
    from public.couple_app_state
   where space_id = p_space_id
     and access_code = p_access_code;

  return result;
end;
$$;

create or replace function public.save_couple_state(
  p_space_id text,
  p_access_code text,
  p_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.couple_app_state (space_id, access_code, payload, updated_at)
  values (p_space_id, p_access_code, p_payload, now())
  on conflict (space_id)
  do update set
    payload = excluded.payload,
    updated_at = now()
  where public.couple_app_state.access_code = p_access_code;

  if not found then
    raise exception 'invalid access code';
  end if;

  return p_payload;
end;
$$;

grant execute on function public.get_couple_state(text, text) to anon;
grant execute on function public.save_couple_state(text, text, jsonb) to anon;
