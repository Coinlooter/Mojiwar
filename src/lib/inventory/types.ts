import type { CardRarity } from "@/lib/game/types";

export type InventoryCardData = {
  playerCardId: string;
  emoji: string;
  name: string;
  rarity: CardRarity;
  description: string;
};

export type InventorySlotData = {
  slotIndex: number;
  unlocked: boolean;
  card: InventoryCardData | null;
};

export type InventoryTalismanData = {
  playerTalismanId: string;
  emoji: string;
  name: string;
  rarity: CardRarity;
  description: string;
};

export type InventoryTalismanSlotData = {
  slotIndex: number;
  talisman: InventoryTalismanData | null;
};
