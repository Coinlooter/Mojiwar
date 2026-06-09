alter table public.characters
  add column if not exists wins integer not null default 0 check (wins >= 0),
  add column if not exists losses integer not null default 0 check (losses >= 0);

create index if not exists characters_wins_power_idx
  on public.characters (wins desc, power desc)
  where is_bot = false;

update public.characters c
set
  wins = coalesce((
    select count(*)
    from public.battles b
    where b.winner_character_id = c.id
  ), 0),
  losses = coalesce((
    select count(*)
    from public.battles b
    where b.loser_character_id = c.id
  ), 0);

create or replace function public.resolve_battle(
  p_attacker_character_id uuid,
  p_defender_character_id uuid,
  p_winner_character_id uuid,
  p_loser_character_id uuid,
  p_rules_version integer,
  p_seed text,
  p_rounds integer,
  p_attacker_power_before integer,
  p_defender_power_before integer,
  p_attacker_xp_gained integer,
  p_defender_xp_gained integer,
  p_battle_log jsonb,
  p_reward_card_id text,
  p_attacker_xp_after integer,
  p_attacker_level_after integer,
  p_attacker_power_after integer,
  p_defender_xp_after integer,
  p_defender_level_after integer,
  p_defender_power_after integer
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_attacker_user_id uuid;
  v_winner_user_id uuid;
  v_battle_id uuid;
  v_reward_player_card_id uuid;
begin
  if p_attacker_character_id = p_defender_character_id then
    raise exception 'Attacker and defender must differ';
  end if;

  select user_id
  into v_attacker_user_id
  from public.characters
  where id = p_attacker_character_id;

  if v_attacker_user_id is null then
    raise exception 'Attacker character not found';
  end if;

  if v_attacker_user_id <> (select auth.uid()) then
    raise exception 'Only the attacker can resolve this battle';
  end if;

  if not exists (
    select 1
    from public.characters
    where id = p_defender_character_id
  ) then
    raise exception 'Defender character not found';
  end if;

  select user_id
  into v_winner_user_id
  from public.characters
  where id = p_winner_character_id;

  if v_winner_user_id is null then
    raise exception 'Winner character not found';
  end if;

  if p_reward_card_id is not null then
    if not exists (
      select 1
      from public.cards
      where id = p_reward_card_id
    ) then
      raise exception 'Reward card not found';
    end if;
  end if;

  insert into public.battles (
    attacker_character_id,
    defender_character_id,
    winner_character_id,
    loser_character_id,
    rules_version,
    seed,
    rounds,
    attacker_power_before,
    defender_power_before,
    attacker_xp_gained,
    defender_xp_gained,
    battle_log,
    viewed_by_attacker_at
  )
  values (
    p_attacker_character_id,
    p_defender_character_id,
    p_winner_character_id,
    p_loser_character_id,
    p_rules_version,
    p_seed,
    p_rounds,
    p_attacker_power_before,
    p_defender_power_before,
    p_attacker_xp_gained,
    p_defender_xp_gained,
    p_battle_log,
    now()
  )
  returning id into v_battle_id;

  if p_reward_card_id is not null then
    insert into public.player_cards (
      user_id,
      card_id,
      acquired_from_battle_id
    )
    values (
      v_winner_user_id,
      p_reward_card_id,
      v_battle_id
    )
    returning id into v_reward_player_card_id;

    update public.battles
    set reward_player_card_id = v_reward_player_card_id
    where id = v_battle_id;
  end if;

  update public.characters
  set
    xp = p_attacker_xp_after,
    level = p_attacker_level_after,
    power = p_attacker_power_after,
    wins = wins + case when id = p_winner_character_id then 1 else 0 end,
    losses = losses + case when id = p_loser_character_id then 1 else 0 end
  where id = p_attacker_character_id;

  update public.characters
  set
    xp = p_defender_xp_after,
    level = p_defender_level_after,
    power = p_defender_power_after,
    wins = wins + case when id = p_winner_character_id then 1 else 0 end,
    losses = losses + case when id = p_loser_character_id then 1 else 0 end
  where id = p_defender_character_id;

  return v_battle_id;
end;
$$;

create or replace function public.get_leaderboard(p_limit integer default 50)
returns table (
  rank bigint,
  character_id uuid,
  emoji text,
  name text,
  level integer,
  power integer,
  wins integer,
  losses integer
)
language sql
security definer
set search_path = public
stable
as $$
  select
    row_number() over (
      order by c.wins desc, c.power desc, c.level desc, c.created_at asc
    ) as rank,
    c.id,
    c.emoji,
    c.name,
    c.level,
    c.power,
    c.wins,
    c.losses
  from public.characters c
  where c.is_bot = false
  order by c.wins desc, c.power desc, c.level desc, c.created_at asc
  limit greatest(coalesce(p_limit, 50), 1);
$$;

grant execute on function public.get_leaderboard(integer) to authenticated;
