create or replace function public.grant_starter_deck(p_character_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_card_id text;
  v_player_card_id uuid;
  v_slot_index integer;
  v_starter_cards text[] := array[
    'ember-punch',
    'tiny-shield',
    'green-heart'
  ];
begin
  select user_id
  into v_user_id
  from public.characters
  where id = p_character_id;

  if v_user_id is null then
    raise exception 'Character not found';
  end if;

  if v_user_id <> (select auth.uid()) then
    raise exception 'Not allowed to grant starter deck for this character';
  end if;

  if exists (
    select 1
    from public.player_cards
    where user_id = v_user_id
  ) then
    raise exception 'Starter deck already granted';
  end if;

  foreach v_card_id in array v_starter_cards loop
    insert into public.player_cards (user_id, card_id)
    values (v_user_id, v_card_id)
    returning id into v_player_card_id;

    v_slot_index := array_position(v_starter_cards, v_card_id) - 1;

    insert into public.deck_slots (character_id, player_card_id, slot_index)
    values (p_character_id, v_player_card_id, v_slot_index);
  end loop;
end;
$$;

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
    power = p_attacker_power_after
  where id = p_attacker_character_id;

  update public.characters
  set
    xp = p_defender_xp_after,
    level = p_defender_level_after,
    power = p_defender_power_after
  where id = p_defender_character_id;

  return v_battle_id;
end;
$$;

grant execute on function public.grant_starter_deck(uuid) to authenticated;
grant execute on function public.resolve_battle(
  uuid,
  uuid,
  uuid,
  uuid,
  integer,
  text,
  integer,
  integer,
  integer,
  integer,
  integer,
  jsonb,
  text,
  integer,
  integer,
  integer,
  integer,
  integer,
  integer
) to authenticated;
