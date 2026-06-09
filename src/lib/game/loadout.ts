import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";
import type { CardDefinition, CardEffectType, CardRarity, CharacterLoadout, CombatStats } from "./types";

type CharacterRow = Database["public"]["Tables"]["characters"]["Row"];
type CardRow = Database["public"]["Tables"]["cards"]["Row"];

export function mapCardRow(card: CardRow): CardDefinition {
  return {
    id: card.id,
    name: card.name,
    emoji: card.emoji,
    rarity: card.rarity as CardRarity,
    effectType: card.effect_type as CardEffectType,
    effectValue: Number(card.effect_value),
    description: card.description,
  };
}

export function mapCharacterRowToBaseStats(character: CharacterRow): CombatStats {
  return {
    hp: character.base_hp,
    attack: character.base_attack,
    defense: character.base_defense,
    speed: character.base_speed,
    critChance: Number(character.base_crit_chance),
  };
}

export function buildCharacterLoadout(
  character: CharacterRow,
  deck: CardDefinition[],
): CharacterLoadout {
  return {
    id: character.id,
    ownerUserId: character.user_id,
    emoji: character.emoji,
    name: character.name,
    level: character.level,
    xp: character.xp,
    baseStats: mapCharacterRowToBaseStats(character),
    deck,
  };
}

async function fetchDeckForCharacter(
  supabase: SupabaseClient<Database>,
  characterId: string,
): Promise<CardDefinition[]> {
  const { data: deckSlots, error: deckSlotsError } = await supabase
    .from("deck_slots")
    .select("player_card_id, slot_index")
    .eq("character_id", characterId)
    .order("slot_index", { ascending: true });

  if (deckSlotsError || !deckSlots?.length) {
    return [];
  }

  const playerCardIds = deckSlots.map((slot) => slot.player_card_id);
  const { data: playerCards, error: playerCardsError } = await supabase
    .from("player_cards")
    .select("id, card_id")
    .in("id", playerCardIds);

  if (playerCardsError || !playerCards?.length) {
    return [];
  }

  const cardIds = playerCards.map((playerCard) => playerCard.card_id);
  const { data: cards, error: cardsError } = await supabase
    .from("cards")
    .select("*")
    .in("id", cardIds);

  if (cardsError || !cards?.length) {
    return [];
  }

  const cardsById = new Map(cards.map((card) => [card.id, mapCardRow(card)]));
  const playerCardById = new Map(
    playerCards.map((playerCard) => [playerCard.id, playerCard.card_id]),
  );

  return deckSlots
    .map((slot) => {
      const cardId = playerCardById.get(slot.player_card_id);
      return cardId ? cardsById.get(cardId) : undefined;
    })
    .filter((card): card is CardDefinition => card !== undefined);
}

export async function fetchCharacterLoadout(
  supabase: SupabaseClient<Database>,
  characterId: string,
): Promise<CharacterLoadout | null> {
  const { data: character, error: characterError } = await supabase
    .from("characters")
    .select("*")
    .eq("id", characterId)
    .maybeSingle();

  if (characterError || !character) {
    return null;
  }

  const deck = await fetchDeckForCharacter(supabase, characterId);
  return buildCharacterLoadout(character, deck);
}

export async function fetchCharacterLoadouts(
  supabase: SupabaseClient<Database>,
  characterIds: string[],
): Promise<CharacterLoadout[]> {
  const loadouts = await Promise.all(
    characterIds.map((characterId) => fetchCharacterLoadout(supabase, characterId)),
  );

  return loadouts.filter((loadout): loadout is CharacterLoadout => loadout !== null);
}
