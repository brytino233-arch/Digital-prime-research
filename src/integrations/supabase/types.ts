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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      competitors: {
        Row: {
          booking_note: string | null
          created_at: string
          id: string
          name: string
          pricing_note: string | null
          prospect_id: string
          search_note: string | null
          ux_note: string | null
          website_note: string | null
        }
        Insert: {
          booking_note?: string | null
          created_at?: string
          id?: string
          name: string
          pricing_note?: string | null
          prospect_id: string
          search_note?: string | null
          ux_note?: string | null
          website_note?: string | null
        }
        Update: {
          booking_note?: string | null
          created_at?: string
          id?: string
          name?: string
          pricing_note?: string | null
          prospect_id?: string
          search_note?: string | null
          ux_note?: string | null
          website_note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "competitors_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      decision_makers: {
        Row: {
          confidence: string
          contact_route: string | null
          created_at: string
          id: string
          name: string
          prospect_id: string
          public_profile: string | null
          role: string | null
        }
        Insert: {
          confidence?: string
          contact_route?: string | null
          created_at?: string
          id?: string
          name: string
          prospect_id: string
          public_profile?: string | null
          role?: string | null
        }
        Update: {
          confidence?: string
          contact_route?: string | null
          created_at?: string
          id?: string
          name?: string
          prospect_id?: string
          public_profile?: string | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "decision_makers_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      evidence: {
        Row: {
          claim: string
          classification: string
          confidence: string
          created_at: string
          date_checked: string
          id: string
          prospect_id: string
          source_name: string
          source_type: string
          source_url: string | null
        }
        Insert: {
          claim: string
          classification?: string
          confidence?: string
          created_at?: string
          date_checked?: string
          id?: string
          prospect_id: string
          source_name: string
          source_type?: string
          source_url?: string | null
        }
        Update: {
          claim?: string
          classification?: string
          confidence?: string
          created_at?: string
          date_checked?: string
          id?: string
          prospect_id?: string
          source_name?: string
          source_type?: string
          source_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evidence_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities: {
        Row: {
          created_at: string
          difficulty: string
          id: string
          impact: string
          prospect_id: string
          rank: number
          solution: string | null
          title: string
          why_it_fits: string | null
        }
        Insert: {
          created_at?: string
          difficulty?: string
          id?: string
          impact?: string
          prospect_id: string
          rank?: number
          solution?: string | null
          title: string
          why_it_fits?: string | null
        }
        Update: {
          created_at?: string
          difficulty?: string
          id?: string
          impact?: string
          prospect_id?: string
          rank?: number
          solution?: string | null
          title?: string
          why_it_fits?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      outreach_messages: {
        Row: {
          channel: string | null
          created_at: string
          cta: string | null
          follow_up: string | null
          id: string
          opening: string | null
          problem: string | null
          prospect_id: string
          target: string | null
          value: string | null
        }
        Insert: {
          channel?: string | null
          created_at?: string
          cta?: string | null
          follow_up?: string | null
          id?: string
          opening?: string | null
          problem?: string | null
          prospect_id: string
          target?: string | null
          value?: string | null
        }
        Update: {
          channel?: string | null
          created_at?: string
          cta?: string | null
          follow_up?: string | null
          id?: string
          opening?: string | null
          problem?: string | null
          prospect_id?: string
          target?: string | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "outreach_messages_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_events: {
        Row: {
          created_at: string
          id: string
          note: string | null
          prospect_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          prospect_id: string
          status: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          prospect_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_events_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      proof_packs: {
        Row: {
          created_at: string
          id: string
          pages: Json
          prospect_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          pages?: Json
          prospect_id: string
        }
        Update: {
          created_at?: string
          id?: string
          pages?: Json
          prospect_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "proof_packs_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      prospects: {
        Row: {
          archived: boolean
          best_contact_channel: string | null
          created_at: string
          email: string | null
          facebook: string | null
          id: string
          industry: string
          instagram: string | null
          is_demo: boolean
          last_researched_at: string
          location: string
          name: string
          operating_status: string
          phone: string | null
          pipeline_status: string
          price_range: string | null
          recommended_offer: string | null
          research_status: string
          score_breakdown: Json
          score_total: number
          strongest_opportunity: string | null
          tiktok: string | null
          updated_at: string
          website: string | null
          why_it_matters: string | null
        }
        Insert: {
          archived?: boolean
          best_contact_channel?: string | null
          created_at?: string
          email?: string | null
          facebook?: string | null
          id?: string
          industry: string
          instagram?: string | null
          is_demo?: boolean
          last_researched_at?: string
          location?: string
          name: string
          operating_status?: string
          phone?: string | null
          pipeline_status?: string
          price_range?: string | null
          recommended_offer?: string | null
          research_status?: string
          score_breakdown?: Json
          score_total?: number
          strongest_opportunity?: string | null
          tiktok?: string | null
          updated_at?: string
          website?: string | null
          why_it_matters?: string | null
        }
        Update: {
          archived?: boolean
          best_contact_channel?: string | null
          created_at?: string
          email?: string | null
          facebook?: string | null
          id?: string
          industry?: string
          instagram?: string | null
          is_demo?: boolean
          last_researched_at?: string
          location?: string
          name?: string
          operating_status?: string
          phone?: string | null
          pipeline_status?: string
          price_range?: string | null
          recommended_offer?: string | null
          research_status?: string
          score_breakdown?: Json
          score_total?: number
          strongest_opportunity?: string | null
          tiktok?: string | null
          updated_at?: string
          website?: string | null
          why_it_matters?: string | null
        }
        Relationships: []
      }
      research_reports: {
        Row: {
          bottlenecks: Json
          created_at: string
          customer_journey: Json
          digital_presence: Json
          id: string
          prospect_id: string
          provider: string
          recommended_offer: Json
          research_goal: string
        }
        Insert: {
          bottlenecks?: Json
          created_at?: string
          customer_journey?: Json
          digital_presence?: Json
          id?: string
          prospect_id: string
          provider?: string
          recommended_offer?: Json
          research_goal?: string
        }
        Update: {
          bottlenecks?: Json
          created_at?: string
          customer_journey?: Json
          digital_presence?: Json
          id?: string
          prospect_id?: string
          provider?: string
          recommended_offer?: Json
          research_goal?: string
        }
        Relationships: [
          {
            foreignKeyName: "research_reports_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
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
