alter table public.characters
  add column if not exists fishing_started_at timestamptz;

update public.characters
set fishing_started_at = now()
where fishing_started_at is null;

create or replace function public.claim_fishing_reward(
  p_requesting_user_id uuid,
  p_character_id uuid,
  p_fishing_started_at timestamptz,
  p_gold_gained integer,
  p_gold_after integer,
  p_new_fishing_started_at timestamptz
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_current_gold integer;
  v_current_fishing_started_at timestamptz;
begin
  if p_requesting_user_id is null or p_character_id is null then
    raise exception 'Requesting user and character are required';
  end if;

  if p_gold_gained < 0 then
    raise exception 'Gold gained cannot be negative';
  end if;

  if p_gold_gained > 5000 then
    raise exception 'Gold gained exceeds maximum';
  end if;

  select user_id, gold, fishing_started_at
  into v_user_id, v_current_gold, v_current_fishing_started_at
  from public.characters
  where id = p_character_id
  for update;

  if v_user_id is null then
    raise exception 'Character not found';
  end if;

  if v_user_id <> p_requesting_user_id then
    raise exception 'Only the owner can claim fishing rewards';
  end if;

  if v_current_fishing_started_at is distinct from p_fishing_started_at then
    raise exception 'Fishing timer mismatch';
  end if;

  if p_gold_after <> v_current_gold + p_gold_gained then
    raise exception 'Gold after mismatch';
  end if;

  update public.characters
  set
    gold = p_gold_after,
    fishing_started_at = p_new_fishing_started_at
  where id = p_character_id;
end;
$$;

revoke all on function public.claim_fishing_reward(
  uuid,
  uuid,
  timestamptz,
  integer,
  integer,
  timestamptz
) from public;

grant execute on function public.claim_fishing_reward(
  uuid,
  uuid,
  timestamptz,
  integer,
  integer,
  timestamptz
) to service_role;
