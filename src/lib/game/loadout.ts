import type { SupabaseClient } from "@supabase/supabase-js";

import { createSupabaseServiceClient } from "@/lib/supabase/service";
import type { Database } from "@/lib/supabase/database.types";
import type {
  CardDefinition,
  CardEffectType,
  CardRarity,
  CharacterLoadout,
  CombatStats,
  TalismanDefinition,
} from "./types";

type CharacterRow = Database["public"]["Tables"]["characters"]["Row"];
type CardRow = Database["public"]["Tables"]["cards"]["Row"];
type TalismanRow = Database["public"]["Tables"]["talismans"]["Row"];

export function mapTalismanRow(talisman: TalismanRow): TalismanDefinition {
  return {
    id: talisman.id,
    name: talisman.name,
    emoji: talisman.emoji,
    rarity: talisman.rarity as CardRarity,
    effectType: talisman.effect_type as CardEffectType,
    effectValue: Number(talisman.effect_value),
    description: talisman.description,
  };
}

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
  talisman: TalismanDefinition | null = null,
): CharacterLoadout {
  return {
    id: character.id,
    ownerUserId: character.user_id,
    emoji: character.emoji,
    name: character.name,
    level: character.level,
    xp: character.xp,
    gold: character.gold,
    baseStats: mapCharacterRowToBaseStats(character),
    deck,
    talisman,
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

async function fetchTalismanForCharacter(
  supabase: SupabaseClient<Database>,
  characterId: string,
): Promise<TalismanDefinition | null> {
  const { data: talismanSlot, error: talismanSlotError } = await supabase
    .from("talisman_slots")
    .select("player_talisman_id")
    .eq("character_id", characterId)
    .eq("slot_index", 0)
    .maybeSingle();

  if (talismanSlotError || !talismanSlot) {
    return null;
  }

  const { data: playerTalisman, error: playerTalismanError } = await supabase
    .from("player_talismans")
    .select("talisman_id")
    .eq("id", talismanSlot.player_talisman_id)
    .maybeSingle();

  if (playerTalismanError || !playerTalisman) {
    return null;
  }

  const { data: talisman, error: talismanError } = await supabase
    .from("talismans")
    .select("*")
    .eq("id", playerTalisman.talisman_id)
    .maybeSingle();

  if (talismanError || !talisman) {
    return null;
  }

  return mapTalismanRow(talisman);
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

  const [deck, talisman] = await Promise.all([
    fetchDeckForCharacter(supabase, characterId),
    fetchTalismanForCharacter(supabase, characterId),
  ]);

  return buildCharacterLoadout(character, deck, talisman);
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

export async function fetchOpponentCharacterLoadout(characterId: string) {
  const supabase = createSupabaseServiceClient();

  return fetchCharacterLoadout(supabase, characterId);
}

export async function fetchOpponentCharacterLoadouts(characterIds: string[]) {
  const supabase = createSupabaseServiceClient();

  return fetchCharacterLoadouts(supabase, characterIds);
}
