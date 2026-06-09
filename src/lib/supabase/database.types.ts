export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          display_name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          display_name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          display_name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      characters: {
        Row: {
          id: string;
          user_id: string;
          emoji: string;
          name: string;
          level: number;
          xp: number;
          base_hp: number;
          base_attack: number;
          base_defense: number;
          base_speed: number;
          base_crit_chance: number;
          power: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          emoji: string;
          name: string;
          level?: number;
          xp?: number;
          base_hp?: number;
          base_attack?: number;
          base_defense?: number;
          base_speed?: number;
          base_crit_chance?: number;
          power?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          emoji?: string;
          name?: string;
          level?: number;
          xp?: number;
          base_hp?: number;
          base_attack?: number;
          base_defense?: number;
          base_speed?: number;
          base_crit_chance?: number;
          power?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      cards: {
        Row: {
          id: string;
          name: string;
          emoji: string;
          rarity: "common" | "rare" | "epic";
          effect_type: string;
          effect_value: number;
          description: string;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          emoji: string;
          rarity: "common" | "rare" | "epic";
          effect_type: string;
          effect_value: number;
          description: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          emoji?: string;
          rarity?: "common" | "rare" | "epic";
          effect_type?: string;
          effect_value?: number;
          description?: string;
          created_at?: string;
        };
      };
      player_cards: {
        Row: {
          id: string;
          user_id: string;
          card_id: string;
          acquired_from_battle_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          card_id: string;
          acquired_from_battle_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          card_id?: string;
          acquired_from_battle_id?: string | null;
          created_at?: string;
        };
      };
      deck_slots: {
        Row: {
          id: string;
          character_id: string;
          player_card_id: string;
          slot_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          character_id: string;
          player_card_id: string;
          slot_index: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          character_id?: string;
          player_card_id?: string;
          slot_index?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      battles: {
        Row: {
          id: string;
          attacker_character_id: string;
          defender_character_id: string;
          winner_character_id: string;
          loser_character_id: string;
          rules_version: number;
          seed: string;
          rounds: number;
          attacker_power_before: number;
          defender_power_before: number;
          attacker_xp_gained: number;
          defender_xp_gained: number;
          reward_player_card_id: string | null;
          battle_log: Json;
          viewed_by_attacker_at: string | null;
          viewed_by_defender_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          attacker_character_id: string;
          defender_character_id: string;
          winner_character_id: string;
          loser_character_id: string;
          rules_version: number;
          seed: string;
          rounds: number;
          attacker_power_before: number;
          defender_power_before: number;
          attacker_xp_gained: number;
          defender_xp_gained: number;
          reward_player_card_id?: string | null;
          battle_log: Json;
          viewed_by_attacker_at?: string | null;
          viewed_by_defender_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          viewed_by_attacker_at?: string | null;
          viewed_by_defender_at?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      card_rarity: "common" | "rare" | "epic";
      card_effect_type:
        | "bonus_hp"
        | "bonus_attack"
        | "bonus_defense"
        | "bonus_speed"
        | "bonus_crit_chance"
        | "first_strike_damage"
        | "low_hp_heal";
    };
    CompositeTypes: Record<string, never>;
  };
};
