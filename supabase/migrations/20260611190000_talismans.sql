create table public.talismans (
  id text primary key,
  name text not null,
  emoji text not null,
  rarity public.card_rarity not null,
  effect_type public.card_effect_type not null,
  effect_value numeric(10, 4) not null,
  description text not null,
  created_at timestamptz not null default now()
);

create table public.player_talismans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  talisman_id text not null references public.talismans(id),
  acquired_from_battle_id uuid,
  created_at timestamptz not null default now()
);

create table public.talisman_slots (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references public.characters(id) on delete cascade,
  player_talisman_id uuid not null references public.player_talismans(id) on delete cascade,
  slot_index integer not null check (slot_index = 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (character_id, slot_index),
  unique (player_talisman_id)
);

alter table public.battles
  add column reward_player_talisman_id uuid references public.player_talismans(id);

alter table public.player_talismans
  add constraint player_talismans_acquired_from_battle_id_fkey
  foreign key (acquired_from_battle_id)
  references public.battles(id)
  on delete set null;

create trigger talisman_slots_set_updated_at
before update on public.talisman_slots
for each row execute function public.set_updated_at();

create index player_talismans_user_id_idx on public.player_talismans(user_id);
create index talisman_slots_character_id_idx on public.talisman_slots(character_id);
create index battles_reward_player_talisman_id_idx on public.battles(reward_player_talisman_id);

alter table public.talismans enable row level security;
alter table public.player_talismans enable row level security;
alter table public.talisman_slots enable row level security;

revoke all on public.talismans from anon, authenticated;
revoke all on public.player_talismans from anon, authenticated;
revoke all on public.talisman_slots from anon, authenticated;

grant select on public.talismans to authenticated;
grant select on public.player_talismans to authenticated;
grant select, insert, update, delete on public.talisman_slots to authenticated;

create policy "Authenticated users can read talismans"
on public.talismans
for select
to authenticated
using ((select auth.uid()) is not null);

create policy "Users can read their owned talismans"
on public.player_talismans
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can manage talisman slots for their characters"
on public.talisman_slots
for all
to authenticated
using (
  exists (
    select 1
    from public.characters c
    where c.id = talisman_slots.character_id
      and c.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.characters c
    where c.id = talisman_slots.character_id
      and c.user_id = (select auth.uid())
  )
  and exists (
    select 1
    from public.player_talismans pt
    where pt.id = talisman_slots.player_talisman_id
      and pt.user_id = (select auth.uid())
  )
);

insert into public.talismans (id, name, emoji, rarity, effect_type, effect_value, description)
values
  ('moss-amulet', 'Moos-Amulett', '🧿', 'common', 'bonus_defense', 2, '+2 Verteidigung (passiv).'),
  ('warmth-charm', 'Wärme-Talisman', '🔮', 'common', 'bonus_hp', 12, '+12 Leben (passiv).'),
  ('rage-rune', 'Wut-Rune', '✨', 'rare', 'bonus_attack', 5, '+5 Angriff (passiv).'),
  ('fortune-coin', 'Glücks-Münze', '🪬', 'epic', 'bonus_crit_chance', 0.05, '+5% Kritchance (passiv).');

revoke execute on function public.resolve_battle(
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
) from service_role;

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
  p_reward_card_id text,
  p_reward_talisman_id text,
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

  if p_reward_card_id is not null and p_reward_talisman_id is not null then
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

  if p_reward_card_id is not null then
    if not exists (
      select 1
      from public.cards
      where id = p_reward_card_id
    ) then
      raise exception 'Reward card not found';
    end if;
  end if;

  if p_reward_talisman_id is not null then
    if not exists (
      select 1
      from public.talismans
      where id = p_reward_talisman_id
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

  if p_reward_talisman_id is not null then
    insert into public.player_talismans (
      user_id,
      talisman_id,
      acquired_from_battle_id
    )
    values (
      v_winner_user_id,
      p_reward_talisman_id,
      v_battle_id
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
    wins = wins + case when id = p_winner_character_id then 1 else 0 end,
    losses = losses + case when id = p_loser_character_id then 1 else 0 end
  where id = p_attacker_character_id;

  update public.characters
  set
    xp = p_defender_xp_after,
    level = p_defender_level_after,
    power = p_defender_power_after,
    gold = p_defender_gold_after,
    wins = wins + case when id = p_winner_character_id then 1 else 0 end,
    losses = losses + case when id = p_loser_character_id then 1 else 0 end
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
  text,
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
) to service_role;
