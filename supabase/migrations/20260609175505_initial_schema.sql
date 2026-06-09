create extension if not exists pgcrypto with schema extensions;

create type public.card_rarity as enum ('common', 'rare', 'epic');
create type public.card_effect_type as enum (
  'bonus_hp',
  'bonus_attack',
  'bonus_defense',
  'bonus_speed',
  'bonus_crit_chance',
  'first_strike_damage',
  'low_hp_heal'
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 32),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.characters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  emoji text not null check (char_length(emoji) between 1 and 16),
  name text not null check (char_length(name) between 2 and 32),
  level integer not null default 1 check (level >= 1),
  xp integer not null default 0 check (xp >= 0),
  base_hp integer not null default 100 check (base_hp > 0),
  base_attack integer not null default 14 check (base_attack > 0),
  base_defense integer not null default 6 check (base_defense >= 0),
  base_speed integer not null default 10 check (base_speed >= 0),
  base_crit_chance numeric(5, 4) not null default 0.0500 check (base_crit_chance between 0 and 0.5),
  power integer not null default 160 check (power > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cards (
  id text primary key,
  name text not null,
  emoji text not null,
  rarity public.card_rarity not null,
  effect_type public.card_effect_type not null,
  effect_value numeric(10, 4) not null,
  description text not null,
  created_at timestamptz not null default now()
);

create table public.player_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  card_id text not null references public.cards(id),
  acquired_from_battle_id uuid,
  created_at timestamptz not null default now()
);

create table public.deck_slots (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references public.characters(id) on delete cascade,
  player_card_id uuid not null references public.player_cards(id) on delete cascade,
  slot_index integer not null check (slot_index between 0 and 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (character_id, slot_index),
  unique (player_card_id)
);

create table public.battles (
  id uuid primary key default gen_random_uuid(),
  attacker_character_id uuid not null references public.characters(id) on delete cascade,
  defender_character_id uuid not null references public.characters(id) on delete cascade,
  winner_character_id uuid not null references public.characters(id) on delete cascade,
  loser_character_id uuid not null references public.characters(id) on delete cascade,
  rules_version integer not null,
  seed text not null,
  rounds integer not null check (rounds > 0),
  attacker_power_before integer not null check (attacker_power_before > 0),
  defender_power_before integer not null check (defender_power_before > 0),
  attacker_xp_gained integer not null check (attacker_xp_gained >= 0),
  defender_xp_gained integer not null check (defender_xp_gained >= 0),
  reward_player_card_id uuid references public.player_cards(id),
  battle_log jsonb not null,
  viewed_by_attacker_at timestamptz,
  viewed_by_defender_at timestamptz,
  created_at timestamptz not null default now(),
  check (attacker_character_id <> defender_character_id),
  check (winner_character_id <> loser_character_id)
);

alter table public.player_cards
  add constraint player_cards_acquired_from_battle_id_fkey
  foreign key (acquired_from_battle_id)
  references public.battles(id)
  on delete set null;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger characters_set_updated_at
before update on public.characters
for each row execute function public.set_updated_at();

create trigger deck_slots_set_updated_at
before update on public.deck_slots
for each row execute function public.set_updated_at();

create index characters_user_id_idx on public.characters(user_id);
create index characters_power_idx on public.characters(power);
create index player_cards_user_id_idx on public.player_cards(user_id);
create index deck_slots_character_id_idx on public.deck_slots(character_id);
create index battles_attacker_character_id_created_at_idx on public.battles(attacker_character_id, created_at desc);
create index battles_defender_character_id_created_at_idx on public.battles(defender_character_id, created_at desc);
create index battles_winner_character_id_idx on public.battles(winner_character_id);

alter table public.profiles enable row level security;
alter table public.characters enable row level security;
alter table public.cards enable row level security;
alter table public.player_cards enable row level security;
alter table public.deck_slots enable row level security;
alter table public.battles enable row level security;

revoke all on public.profiles from anon, authenticated;
revoke all on public.characters from anon, authenticated;
revoke all on public.cards from anon, authenticated;
revoke all on public.player_cards from anon, authenticated;
revoke all on public.deck_slots from anon, authenticated;
revoke all on public.battles from anon, authenticated;

grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.characters to authenticated;
grant select on public.cards to authenticated;
grant select on public.player_cards to authenticated;
grant select, insert, update, delete on public.deck_slots to authenticated;
grant select on public.battles to authenticated;
grant update (viewed_by_attacker_at, viewed_by_defender_at) on public.battles to authenticated;

create policy "Authenticated users can read profiles"
on public.profiles
for select
to authenticated
using ((select auth.uid()) is not null);

create policy "Users can insert their own profile"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Authenticated users can read characters"
on public.characters
for select
to authenticated
using ((select auth.uid()) is not null);

create policy "Users can insert their own characters"
on public.characters
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own characters"
on public.characters
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own characters"
on public.characters
for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "Authenticated users can read cards"
on public.cards
for select
to authenticated
using ((select auth.uid()) is not null);

create policy "Users can read their owned cards"
on public.player_cards
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can read deck slots for visible characters"
on public.deck_slots
for select
to authenticated
using (
  exists (
    select 1
    from public.characters c
    where c.id = deck_slots.character_id
  )
);

create policy "Users can insert owned deck slots"
on public.deck_slots
for insert
to authenticated
with check (
  exists (
    select 1
    from public.characters c
    where c.id = deck_slots.character_id
      and c.user_id = (select auth.uid())
  )
  and exists (
    select 1
    from public.player_cards pc
    where pc.id = deck_slots.player_card_id
      and pc.user_id = (select auth.uid())
  )
);

create policy "Users can update owned deck slots"
on public.deck_slots
for update
to authenticated
using (
  exists (
    select 1
    from public.characters c
    where c.id = deck_slots.character_id
      and c.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.characters c
    where c.id = deck_slots.character_id
      and c.user_id = (select auth.uid())
  )
  and exists (
    select 1
    from public.player_cards pc
    where pc.id = deck_slots.player_card_id
      and pc.user_id = (select auth.uid())
  )
);

create policy "Users can delete owned deck slots"
on public.deck_slots
for delete
to authenticated
using (
  exists (
    select 1
    from public.characters c
    where c.id = deck_slots.character_id
      and c.user_id = (select auth.uid())
  )
);

create policy "Participants can read battle history"
on public.battles
for select
to authenticated
using (
  exists (
    select 1
    from public.characters c
    where c.id in (battles.attacker_character_id, battles.defender_character_id)
      and c.user_id = (select auth.uid())
  )
);

create policy "Participants can mark battle views"
on public.battles
for update
to authenticated
using (
  exists (
    select 1
    from public.characters c
    where c.id in (battles.attacker_character_id, battles.defender_character_id)
      and c.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.characters c
    where c.id in (battles.attacker_character_id, battles.defender_character_id)
      and c.user_id = (select auth.uid())
  )
);

insert into public.cards (id, name, emoji, rarity, effect_type, effect_value, description)
values
  ('ember-punch', 'Funkenhieb', '🔥', 'common', 'bonus_attack', 4, '+4 Angriff.'),
  ('tiny-shield', 'Mini-Schild', '🛡️', 'common', 'bonus_defense', 3, '+3 Verteidigung.'),
  ('green-heart', 'Gruenes Herz', '💚', 'common', 'bonus_hp', 18, '+18 Leben.'),
  ('swift-sneaker', 'Flotter Sneaker', '👟', 'common', 'bonus_speed', 3, '+3 Tempo.'),
  ('lucky-star', 'Gluecksstern', '⭐', 'rare', 'bonus_crit_chance', 0.08, '+8% Kritchance.'),
  ('opening-boom', 'Startknall', '💥', 'rare', 'first_strike_damage', 9, 'Fuegt in Runde 1 Extraschaden zu.'),
  ('panic-snack', 'Panik-Snack', '🍱', 'epic', 'low_hp_heal', 16, 'Heilt einmalig, wenn das Emoji unter 35% Leben faellt.');
