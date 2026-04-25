export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      cached_recommendations: {
        Row: {
          created_at: string
          household_id: string
          id: string
          plan_count: number
          recommendations: Json
        }
        Insert: {
          created_at?: string
          household_id: string
          id?: string
          plan_count?: number
          recommendations?: Json
        }
        Update: {
          created_at?: string
          household_id?: string
          id?: string
          plan_count?: number
          recommendations?: Json
        }
        Relationships: [
          {
            foreignKeyName: "cached_recommendations_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: true
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      evening_checkins: {
        Row: {
          created_at: string
          effort_level: string | null
          household_id: string
          id: string
          plan_day_id: string
          tags: string[]
        }
        Insert: {
          created_at?: string
          effort_level?: string | null
          household_id: string
          id?: string
          plan_day_id: string
          tags?: string[]
        }
        Update: {
          created_at?: string
          effort_level?: string | null
          household_id?: string
          id?: string
          plan_day_id?: string
          tags?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "evening_checkins_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evening_checkins_plan_day_id_fkey"
            columns: ["plan_day_id"]
            isOneToOne: true
            referencedRelation: "plan_days"
            referencedColumns: ["id"]
          },
        ]
      }
      grocery_items: {
        Row: {
          category: string
          created_at: string
          id: string
          is_checked: boolean | null
          is_staple: boolean | null
          item_name: string
          plan_id: string
          quantity: string | null
          source: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          is_checked?: boolean | null
          is_staple?: boolean | null
          item_name: string
          plan_id: string
          quantity?: string | null
          source?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          is_checked?: boolean | null
          is_staple?: boolean | null
          item_name?: string
          plan_id?: string
          quantity?: string | null
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "grocery_items_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "weekly_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      household_preferences: {
        Row: {
          allergies: string[] | null
          cooking_time_tolerance: string | null
          created_at: string
          cuisines_disliked: string[] | null
          cuisines_liked: string[] | null
          delivery_preference: string | null
          dietary_preferences: string[] | null
          foods_to_avoid: string[] | null
          grocery_store: string | null
          health_goal: string | null
          household_id: string
          id: string
          plan_preference: string | null
          preferred_takeout_frequency: number | null
          updated_at: string
          weekly_grocery_budget: number | null
        }
        Insert: {
          allergies?: string[] | null
          cooking_time_tolerance?: string | null
          created_at?: string
          cuisines_disliked?: string[] | null
          cuisines_liked?: string[] | null
          delivery_preference?: string | null
          dietary_preferences?: string[] | null
          foods_to_avoid?: string[] | null
          grocery_store?: string | null
          health_goal?: string | null
          household_id: string
          id?: string
          plan_preference?: string | null
          preferred_takeout_frequency?: number | null
          updated_at?: string
          weekly_grocery_budget?: number | null
        }
        Update: {
          allergies?: string[] | null
          cooking_time_tolerance?: string | null
          created_at?: string
          cuisines_disliked?: string[] | null
          cuisines_liked?: string[] | null
          delivery_preference?: string | null
          dietary_preferences?: string[] | null
          foods_to_avoid?: string[] | null
          grocery_store?: string | null
          health_goal?: string | null
          household_id?: string
          id?: string
          plan_preference?: string | null
          preferred_takeout_frequency?: number | null
          updated_at?: string
          weekly_grocery_budget?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "household_preferences_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: true
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      households: {
        Row: {
          child_age_bands: string[] | null
          created_at: string
          id: string
          name: string
          num_adults: number
          num_children: number
          owner_id: string
          updated_at: string
        }
        Insert: {
          child_age_bands?: string[] | null
          created_at?: string
          id?: string
          name?: string
          num_adults?: number
          num_children?: number
          owner_id: string
          updated_at?: string
        }
        Update: {
          child_age_bands?: string[] | null
          created_at?: string
          id?: string
          name?: string
          num_adults?: number
          num_children?: number
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      meal_feedback: {
        Row: {
          created_at: string
          feedback: Database["public"]["Enums"]["feedback_type"]
          household_id: string
          id: string
          meal_name: string
          notes: string | null
          plan_day_id: string | null
        }
        Insert: {
          created_at?: string
          feedback: Database["public"]["Enums"]["feedback_type"]
          household_id: string
          id?: string
          meal_name: string
          notes?: string | null
          plan_day_id?: string | null
        }
        Update: {
          created_at?: string
          feedback?: Database["public"]["Enums"]["feedback_type"]
          household_id?: string
          id?: string
          meal_name?: string
          notes?: string | null
          plan_day_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_feedback_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_feedback_plan_day_id_fkey"
            columns: ["plan_day_id"]
            isOneToOne: false
            referencedRelation: "plan_days"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_days: {
        Row: {
          calories: number | null
          carbs_g: number | null
          created_at: string
          cuisine_type: string | null
          day_of_week: number
          fat_g: number | null
          fiber_g: number | null
          id: string
          ingredients: Json | null
          instructions: string[] | null
          is_locked: boolean | null
          leftover_source_day: number | null
          meal_description: string | null
          meal_mode: Database["public"]["Enums"]["meal_mode"]
          meal_name: string | null
          notes: string | null
          plan_id: string
          prep_time_minutes: number | null
          protein_g: number | null
          takeout_budget: number | null
          updated_at: string
        }
        Insert: {
          calories?: number | null
          carbs_g?: number | null
          created_at?: string
          cuisine_type?: string | null
          day_of_week: number
          fat_g?: number | null
          fiber_g?: number | null
          id?: string
          ingredients?: Json | null
          instructions?: string[] | null
          is_locked?: boolean | null
          leftover_source_day?: number | null
          meal_description?: string | null
          meal_mode?: Database["public"]["Enums"]["meal_mode"]
          meal_name?: string | null
          notes?: string | null
          plan_id: string
          prep_time_minutes?: number | null
          protein_g?: number | null
          takeout_budget?: number | null
          updated_at?: string
        }
        Update: {
          calories?: number | null
          carbs_g?: number | null
          created_at?: string
          cuisine_type?: string | null
          day_of_week?: number
          fat_g?: number | null
          fiber_g?: number | null
          id?: string
          ingredients?: Json | null
          instructions?: string[] | null
          is_locked?: boolean | null
          leftover_source_day?: number | null
          meal_description?: string | null
          meal_mode?: Database["public"]["Enums"]["meal_mode"]
          meal_name?: string | null
          notes?: string | null
          plan_id?: string
          prep_time_minutes?: number | null
          protein_g?: number | null
          takeout_budget?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_days_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "weekly_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          enabled_dinner_reveal: boolean
          enabled_evening_checkin: boolean
          enabled_weekly_plan_ready: boolean
          endpoint: string
          id: string
          last_used_at: string | null
          p256dh: string
          timezone: string
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          enabled_dinner_reveal?: boolean
          enabled_evening_checkin?: boolean
          enabled_weekly_plan_ready?: boolean
          endpoint: string
          id?: string
          last_used_at?: string | null
          p256dh: string
          timezone?: string
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          enabled_dinner_reveal?: boolean
          enabled_evening_checkin?: boolean
          enabled_weekly_plan_ready?: boolean
          endpoint?: string
          id?: string
          last_used_at?: string | null
          p256dh?: string
          timezone?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      saved_meals: {
        Row: {
          created_at: string
          frequency: string
          household_id: string
          id: string
          include_in_plan: boolean
          meal_description: string | null
          meal_name: string
        }
        Insert: {
          created_at?: string
          frequency?: string
          household_id: string
          id?: string
          include_in_plan?: boolean
          meal_description?: string | null
          meal_name: string
        }
        Update: {
          created_at?: string
          frequency?: string
          household_id?: string
          id?: string
          include_in_plan?: boolean
          meal_description?: string | null
          meal_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_meals_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_takeout_preferences: {
        Row: {
          avg_cost: number | null
          created_at: string
          cuisine_type: string
          household_id: string
          id: string
          notes: string | null
          restaurant_name: string | null
        }
        Insert: {
          avg_cost?: number | null
          created_at?: string
          cuisine_type: string
          household_id: string
          id?: string
          notes?: string | null
          restaurant_name?: string | null
        }
        Update: {
          avg_cost?: number | null
          created_at?: string
          cuisine_type?: string
          household_id?: string
          id?: string
          notes?: string | null
          restaurant_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_takeout_preferences_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      weekly_contexts: {
        Row: {
          budget_week: boolean | null
          chaotic_week: boolean | null
          created_at: string
          guests_visiting: boolean | null
          high_protein_week: boolean | null
          household_id: string
          id: string
          low_cleanup_week: boolean | null
          newborn_in_house: boolean | null
          one_parent_traveling: boolean | null
          sick_week: boolean | null
          sports_week: boolean | null
          updated_at: string
          week_start: string
        }
        Insert: {
          budget_week?: boolean | null
          chaotic_week?: boolean | null
          created_at?: string
          guests_visiting?: boolean | null
          high_protein_week?: boolean | null
          household_id: string
          id?: string
          low_cleanup_week?: boolean | null
          newborn_in_house?: boolean | null
          one_parent_traveling?: boolean | null
          sick_week?: boolean | null
          sports_week?: boolean | null
          updated_at?: string
          week_start: string
        }
        Update: {
          budget_week?: boolean | null
          chaotic_week?: boolean | null
          created_at?: string
          guests_visiting?: boolean | null
          high_protein_week?: boolean | null
          household_id?: string
          id?: string
          low_cleanup_week?: boolean | null
          newborn_in_house?: boolean | null
          one_parent_traveling?: boolean | null
          sick_week?: boolean | null
          sports_week?: boolean | null
          updated_at?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_contexts_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_plans: {
        Row: {
          context_id: string | null
          created_at: string
          household_id: string
          id: string
          reality_message: string | null
          reality_score: number | null
          updated_at: string
          week_start: string
        }
        Insert: {
          context_id?: string | null
          created_at?: string
          household_id: string
          id?: string
          reality_message?: string | null
          reality_score?: number | null
          updated_at?: string
          week_start: string
        }
        Update: {
          context_id?: string | null
          created_at?: string
          household_id?: string
          id?: string
          reality_message?: string | null
          reality_score?: number | null
          updated_at?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_plans_context_id_fkey"
            columns: ["context_id"]
            isOneToOne: false
            referencedRelation: "weekly_contexts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_plans_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      feedback_type:
        | "loved"
        | "okay"
        | "kids_refused"
        | "too_hard"
        | "good_leftovers"
        | "reorder_worthy"
      meal_mode: "cook" | "leftovers" | "takeout" | "dine_out" | "emergency"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      feedback_type: [
        "loved",
        "okay",
        "kids_refused",
        "too_hard",
        "good_leftovers",
        "reorder_worthy",
      ],
      meal_mode: ["cook", "leftovers", "takeout", "dine_out", "emergency"],
    },
  },
} as const
