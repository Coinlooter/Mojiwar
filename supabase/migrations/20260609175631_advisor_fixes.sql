alter function public.set_updated_at() set search_path = public, pg_temp;

create index if not exists battles_loser_character_id_idx
  on public.battles(loser_character_id);

create index if not exists battles_reward_player_card_id_idx
  on public.battles(reward_player_card_id);

create index if not exists player_cards_acquired_from_battle_id_idx
  on public.player_cards(acquired_from_battle_id);

create index if not exists player_cards_card_id_idx
  on public.player_cards(card_id);
