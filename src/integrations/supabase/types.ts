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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      advisory_sources: {
        Row: {
          created_at: string
          experiment_id: string
          id: string
          name: string
          notes: string
          type: string
        }
        Insert: {
          created_at?: string
          experiment_id: string
          id?: string
          name?: string
          notes?: string
          type?: string
        }
        Update: {
          created_at?: string
          experiment_id?: string
          id?: string
          name?: string
          notes?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "advisory_sources_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      experiments: {
        Row: {
          created_at: string
          crop: string
          id: string
          season: string
          sowing_date: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          crop: string
          id?: string
          season?: string
          sowing_date?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          crop?: string
          id?: string
          season?: string
          sowing_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      harvests: {
        Row: {
          created_at: string
          date: string
          id: string
          plot_id: string
          price_per_unit: number
          yield_qty: number
          yield_unit: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          plot_id: string
          price_per_unit?: number
          yield_qty?: number
          yield_unit?: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          plot_id?: string
          price_per_unit?: number
          yield_qty?: number
          yield_unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "harvests_plot_id_fkey"
            columns: ["plot_id"]
            isOneToOne: false
            referencedRelation: "plots"
            referencedColumns: ["id"]
          },
        ]
      }
      operations: {
        Row: {
          cost: number
          created_at: string
          date: string
          id: string
          input_type: string
          notes: string
          observation_rating: string | null
          plot_id: string
          quantity: number
          type: string
          unit: string
        }
        Insert: {
          cost?: number
          created_at?: string
          date?: string
          id?: string
          input_type?: string
          notes?: string
          observation_rating?: string | null
          plot_id: string
          quantity?: number
          type?: string
          unit?: string
        }
        Update: {
          cost?: number
          created_at?: string
          date?: string
          id?: string
          input_type?: string
          notes?: string
          observation_rating?: string | null
          plot_id?: string
          quantity?: number
          type?: string
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "operations_plot_id_fkey"
            columns: ["plot_id"]
            isOneToOne: false
            referencedRelation: "plots"
            referencedColumns: ["id"]
          },
        ]
      }
      plots: {
        Row: {
          advisory_source_id: string | null
          area: number
          created_at: string
          experiment_id: string
          id: string
          label: string
          type: string
        }
        Insert: {
          advisory_source_id?: string | null
          area?: number
          created_at?: string
          experiment_id: string
          id?: string
          label?: string
          type?: string
        }
        Update: {
          advisory_source_id?: string | null
          area?: number
          created_at?: string
          experiment_id?: string
          id?: string
          label?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "plots_advisory_source_id_fkey"
            columns: ["advisory_source_id"]
            isOneToOne: false
            referencedRelation: "advisory_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plots_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          district: string
          id: string
          land_size: number
          land_unit: string
          language: string
          main_crops: string[]
          name: string
          state: string
          updated_at: string
          user_id: string
          village: string
        }
        Insert: {
          created_at?: string
          district?: string
          id?: string
          land_size?: number
          land_unit?: string
          language?: string
          main_crops?: string[]
          name?: string
          state?: string
          updated_at?: string
          user_id: string
          village?: string
        }
        Update: {
          created_at?: string
          district?: string
          id?: string
          land_size?: number
          land_unit?: string
          language?: string
          main_crops?: string[]
          name?: string
          state?: string
          updated_at?: string
          user_id?: string
          village?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
