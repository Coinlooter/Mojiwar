export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
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
        Relationships: [];
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
          gold: number;
          wins: number;
          losses: number;
          is_bot: boolean;
          unlocked_slot_count: number;
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
          gold?: number;
          wins?: number;
          losses?: number;
          is_bot?: boolean;
          unlocked_slot_count?: number;
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
          gold?: number;
          wins?: number;
          losses?: number;
          is_bot?: boolean;
          unlocked_slot_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
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
        Relationships: [];
      };
      player_cards: {
        Row: {
          id: string;
          user_id: string;
          card_id: string;
          acquired_from_battle_id: string | null;
          quality: Database["public"]["Enums"]["card_rarity"] | null;
          display_name: string | null;
          affixes: Json | null;
          legendary_affix: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          card_id: string;
          acquired_from_battle_id?: string | null;
          quality?: Database["public"]["Enums"]["card_rarity"] | null;
          display_name?: string | null;
          affixes?: Json | null;
          legendary_affix?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          card_id?: string;
          acquired_from_battle_id?: string | null;
          quality?: Database["public"]["Enums"]["card_rarity"] | null;
          display_name?: string | null;
          affixes?: Json | null;
          legendary_affix?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
      talismans: {
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
        Relationships: [];
      };
      player_talismans: {
        Row: {
          id: string;
          user_id: string;
          talisman_id: string;
          acquired_from_battle_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          talisman_id: string;
          acquired_from_battle_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          talisman_id?: string;
          acquired_from_battle_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      talisman_slots: {
        Row: {
          id: string;
          character_id: string;
          player_talisman_id: string;
          slot_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          character_id: string;
          player_talisman_id: string;
          slot_index: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          character_id?: string;
          player_talisman_id?: string;
          slot_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
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
        Relationships: [];
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
          reward_player_talisman_id: string | null;
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
          attacker_character_id?: string;
          defender_character_id?: string;
          winner_character_id?: string;
          loser_character_id?: string;
          rules_version?: number;
          seed?: string;
          rounds?: number;
          attacker_power_before?: number;
          defender_power_before?: number;
          attacker_xp_gained?: number;
          defender_xp_gained?: number;
          reward_player_card_id?: string | null;
          battle_log?: Json;
          viewed_by_attacker_at?: string | null;
          viewed_by_defender_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      progress_recovery_codes: {
        Row: {
          id: string;
          user_id: string;
          color_slug: string;
          animal_slug: string;
          number_suffix: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          color_slug: string;
          animal_slug: string;
          number_suffix: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          color_slug?: string;
          animal_slug?: string;
          number_suffix?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      progress_recovery_attempts: {
        Row: {
          id: string;
          ip_hash: string;
          attempted_at: string;
        };
        Insert: {
          id?: string;
          ip_hash: string;
          attempted_at?: string;
        };
        Update: {
          id?: string;
          ip_hash?: string;
          attempted_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      grant_starter_deck: {
        Args: {
          p_character_id: string;
        };
        Returns: undefined;
      };
      resolve_battle: {
        Args: {
          p_requesting_user_id: string;
          p_attacker_character_id: string;
          p_defender_character_id: string;
          p_winner_character_id: string;
          p_loser_character_id: string;
          p_rules_version: number;
          p_seed: string;
          p_rounds: number;
          p_attacker_power_before: number;
          p_defender_power_before: number;
          p_attacker_xp_gained: number;
          p_defender_xp_gained: number;
          p_battle_log: Json;
          p_reward_card_roll: Json | null;
          p_reward_talisman_id: string | null;
          p_attacker_xp_after: number;
          p_attacker_level_after: number;
          p_attacker_power_after: number;
          p_attacker_gold_gained: number;
          p_attacker_gold_after: number;
          p_defender_xp_after: number;
          p_defender_level_after: number;
          p_defender_power_after: number;
          p_defender_gold_gained: number;
          p_defender_gold_after: number;
        };
        Returns: string;
      };
      get_leaderboard: {
        Args: {
          p_limit?: number;
        };
        Returns: {
          rank: number;
          character_id: string;
          emoji: string;
          name: string;
          level: number;
          power: number;
          wins: number;
          losses: number;
        }[];
      };
      lookup_progress_recovery_code: {
        Args: {
          p_color_slug: string;
          p_animal_slug: string;
          p_number_suffix: string;
        };
        Returns: string;
      };
    };
    Enums: {
      card_rarity: "common" | "rare" | "epic" | "legendary";
      card_effect_type:
        | "bonus_hp"
        | "bonus_attack"
        | "bonus_defense"
        | "bonus_speed"
        | "bonus_crit_chance"
        | "first_strike_damage"
        | "low_hp_heal"
        | "vampiric_lifesteal"
        | "thorns_reflect"
        | "battle_frenzy_attack"
        | "opening_barrier"
        | "double_strike_chance";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
