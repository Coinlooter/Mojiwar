alter table public.characters
  add column if not exists unlocked_slot_count integer not null default 3
  check (unlocked_slot_count between 1 and 10);

alter table public.deck_slots
  drop constraint if exists deck_slots_slot_index_check;

alter table public.deck_slots
  add constraint deck_slots_slot_index_check
  check (slot_index between 0 and 9);

delete from public.deck_slots ds
using public.characters c
where ds.character_id = c.id
  and ds.slot_index >= c.unlocked_slot_count;

create or replace function public.validate_deck_slot_index()
returns trigger
language plpgsql
as $$
declare
  v_unlocked integer;
begin
  select unlocked_slot_count
  into v_unlocked
  from public.characters
  where id = new.character_id;

  if v_unlocked is null then
    raise exception 'Character not found for deck slot';
  end if;

  if new.slot_index >= v_unlocked then
    raise exception 'Deck slot is locked';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_deck_slot_index on public.deck_slots;

create trigger validate_deck_slot_index
before insert or update on public.deck_slots
for each row execute function public.validate_deck_slot_index();

create or replace function public.guard_character_progression_update()
returns trigger
language plpgsql
as $$
begin
  if coalesce(auth.jwt()->>'role', '') in ('service_role', 'supabase_admin') then
    return new;
  end if;

  if (
    new.xp is distinct from old.xp
    or new.level is distinct from old.level
    or new.power is distinct from old.power
    or new.gold is distinct from old.gold
    or new.wins is distinct from old.wins
    or new.losses is distinct from old.losses
    or new.unlocked_slot_count is distinct from old.unlocked_slot_count
    or new.base_hp is distinct from old.base_hp
    or new.base_attack is distinct from old.base_attack
    or new.base_defense is distinct from old.base_defense
    or new.base_speed is distinct from old.base_speed
    or new.base_crit_chance is distinct from old.base_crit_chance
    or new.is_bot is distinct from old.is_bot
  ) then
    raise exception 'Progression fields cannot be updated directly';
  end if;

  return new;
end;
$$;
