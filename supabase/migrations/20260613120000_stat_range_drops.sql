alter table public.player_talismans
  add column if not exists effect_value numeric,
  add column if not exists rolled_description text;

drop function if exists public.resolve_battle(
  uuid,
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
  jsonb,
  text,
  integer,
  integer,
  integer,
  integer,
  integer,
  integer,
  integer,
  integer,
  integer,
  integer
);

create or replace function public.resolve_battle(
  p_requesting_user_id uuid,
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
  p_reward_card_roll jsonb,
  p_reward_talisman_roll jsonb,
  p_attacker_xp_after integer,
  p_attacker_level_after integer,
  p_attacker_power_after integer,
  p_attacker_gold_gained integer,
  p_attacker_gold_after integer,
  p_defender_xp_after integer,
  p_defender_level_after integer,
  p_defender_power_after integer,
  p_defender_gold_gained integer,
  p_defender_gold_after integer
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
  v_reward_player_talisman_id uuid;
  v_log_winner_side text;
  v_expected_winner uuid;
  v_expected_loser uuid;
  v_base_card_id text;
  v_talisman_id text;
begin
  if p_requesting_user_id is null then
    raise exception 'Requesting user is required';
  end if;

  if p_attacker_character_id = p_defender_character_id then
    raise exception 'Attacker and defender must differ';
  end if;

  if p_winner_character_id = p_loser_character_id then
    raise exception 'Winner and loser must differ';
  end if;

  if p_reward_card_roll is not null and p_reward_talisman_roll is not null then
    raise exception 'Only one reward type is allowed';
  end if;

  if p_attacker_gold_gained < 0 or p_defender_gold_gained < 0 then
    raise exception 'Gold gained cannot be negative';
  end if;

  if p_attacker_gold_gained > 0 and p_winner_character_id <> p_attacker_character_id then
    raise exception 'Only the winner can gain gold';
  end if;

  if p_defender_gold_gained > 0 and p_winner_character_id <> p_defender_character_id then
    raise exception 'Only the winner can gain gold';
  end if;

  select user_id
  into v_attacker_user_id
  from public.characters
  where id = p_attacker_character_id;

  if v_attacker_user_id is null then
    raise exception 'Attacker character not found';
  end if;

  if v_attacker_user_id <> p_requesting_user_id then
    raise exception 'Only the attacker can resolve this battle';
  end if;

  if not exists (
    select 1
    from public.characters
    where id = p_defender_character_id
  ) then
    raise exception 'Defender character not found';
  end if;

  if (p_battle_log->>'rulesVersion')::integer is distinct from p_rules_version then
    raise exception 'Battle log rules version mismatch';
  end if;

  if p_battle_log->>'seed' is distinct from p_seed then
    raise exception 'Battle log seed mismatch';
  end if;

  if (p_battle_log->>'rounds')::integer is distinct from p_rounds then
    raise exception 'Battle log rounds mismatch';
  end if;

  if (p_battle_log->'xp'->>'attacker')::integer is distinct from p_attacker_xp_gained then
    raise exception 'Attacker XP mismatch';
  end if;

  if (p_battle_log->'xp'->>'defender')::integer is distinct from p_defender_xp_gained then
    raise exception 'Defender XP mismatch';
  end if;

  v_log_winner_side := p_battle_log->>'winnerSide';

  if v_log_winner_side = 'attacker' then
    v_expected_winner := p_attacker_character_id;
    v_expected_loser := p_defender_character_id;
  elsif v_log_winner_side = 'defender' then
    v_expected_winner := p_defender_character_id;
    v_expected_loser := p_attacker_character_id;
  else
    raise exception 'Invalid winner side in battle log';
  end if;

  if p_winner_character_id is distinct from v_expected_winner then
    raise exception 'Winner mismatch';
  end if;

  if p_loser_character_id is distinct from v_expected_loser then
    raise exception 'Loser mismatch';
  end if;

  if (p_battle_log->'attackerSnapshot'->>'characterId')::uuid
    is distinct from p_attacker_character_id then
    raise exception 'Attacker snapshot mismatch';
  end if;

  if (p_battle_log->'defenderSnapshot'->>'characterId')::uuid
    is distinct from p_defender_character_id then
    raise exception 'Defender snapshot mismatch';
  end if;

  select user_id
  into v_winner_user_id
  from public.characters
  where id = p_winner_character_id;

  if v_winner_user_id is null then
    raise exception 'Winner character not found';
  end if;

  if p_reward_card_roll is not null then
    v_base_card_id := p_reward_card_roll->>'baseCardId';

    if v_base_card_id is null then
      raise exception 'Reward card base id is required';
    end if;

    if not exists (
      select 1
      from public.cards
      where id = v_base_card_id
    ) then
      raise exception 'Reward card base not found';
    end if;
  end if;

  if p_reward_talisman_roll is not null then
    v_talisman_id := p_reward_talisman_roll->>'talismanId';

    if v_talisman_id is null then
      raise exception 'Reward talisman id is required';
    end if;

    if not exists (
      select 1
      from public.talismans
      where id = v_talisman_id
    ) then
      raise exception 'Reward talisman not found';
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

  if p_reward_card_roll is not null then
    insert into public.player_cards (
      user_id,
      card_id,
      acquired_from_battle_id,
      quality,
      display_name,
      affixes,
      legendary_affix
    )
    values (
      v_winner_user_id,
      v_base_card_id,
      v_battle_id,
      (p_reward_card_roll->>'quality')::public.card_rarity,
      p_reward_card_roll->>'displayName',
      p_reward_card_roll->'affixes',
      nullif(p_reward_card_roll->'legendaryAffix', 'null'::jsonb)
    )
    returning id into v_reward_player_card_id;

    update public.battles
    set reward_player_card_id = v_reward_player_card_id
    where id = v_battle_id;
  end if;

  if p_reward_talisman_roll is not null then
    insert into public.player_talismans (
      user_id,
      talisman_id,
      acquired_from_battle_id,
      effect_value,
      rolled_description
    )
    values (
      v_winner_user_id,
      v_talisman_id,
      v_battle_id,
      (p_reward_talisman_roll->>'effectValue')::numeric,
      p_reward_talisman_roll->>'description'
    )
    returning id into v_reward_player_talisman_id;

    update public.battles
    set reward_player_talisman_id = v_reward_player_talisman_id
    where id = v_battle_id;
  end if;

  update public.characters
  set
    xp = p_attacker_xp_after,
    level = p_attacker_level_after,
    power = p_attacker_power_after,
    gold = p_attacker_gold_after,
    wins = wins + case when p_winner_character_id = p_attacker_character_id then 1 else 0 end,
    losses = losses + case when p_loser_character_id = p_attacker_character_id then 1 else 0 end
  where id = p_attacker_character_id;

  update public.characters
  set
    xp = p_defender_xp_after,
    level = p_defender_level_after,
    power = p_defender_power_after,
    gold = p_defender_gold_after,
    wins = wins + case when p_winner_character_id = p_defender_character_id then 1 else 0 end,
    losses = losses + case when p_loser_character_id = p_defender_character_id then 1 else 0 end
  where id = p_defender_character_id;

  return v_battle_id;
end;
$$;

grant execute on function public.resolve_battle(
  uuid,
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
  jsonb,
  jsonb,
  integer,
  integer,
  integer,
  integer,
  integer,
  integer,
  integer,
  integer,
  integer,
  integer
) to service_role;
