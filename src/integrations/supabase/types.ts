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
      access_codes: {
        Row: {
          answer: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          role?: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: []
      }
      admin_sessions: {
        Row: {
          created_at: string
          expires_at: string
          token: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          token: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          token?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          created_at: string
          date: string
          id: string
          is_ai: boolean
          page_key: string | null
          sender: string
          status: string
          telegram_message_id: number | null
          text: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          is_ai?: boolean
          page_key?: string | null
          sender: string
          status?: string
          telegram_message_id?: number | null
          text: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          is_ai?: boolean
          page_key?: string | null
          sender?: string
          status?: string
          telegram_message_id?: number | null
          text?: string
        }
        Relationships: []
      }
      email_subscribers: {
        Row: {
          backup_email: string | null
          id: string
          primary_email: string
          subscribed_at: string
        }
        Insert: {
          backup_email?: string | null
          id?: string
          primary_email: string
          subscribed_at?: string
        }
        Update: {
          backup_email?: string | null
          id?: string
          primary_email?: string
          subscribed_at?: string
        }
        Relationships: []
      }
      page_images: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          image_path: string
          media_type: string
          page_key: string
          sort_order: number
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          image_path: string
          media_type?: string
          page_key: string
          sort_order?: number
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          image_path?: string
          media_type?: string
          page_key?: string
          sort_order?: number
        }
        Relationships: []
      }
      page_settings: {
        Row: {
          description: string | null
          page_key: string
          premiere_date: string | null
          updated_at: string
        }
        Insert: {
          description?: string | null
          page_key: string
          premiere_date?: string | null
          updated_at?: string
        }
        Update: {
          description?: string | null
          page_key?: string
          premiere_date?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      saved_notes: {
        Row: {
          created_at: string
          date: string
          id: string
          text: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          text: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          text?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      telegram_updates: {
        Row: {
          chat_id: number | null
          message_id: number | null
          page_key: string | null
          raw_update: Json
          received_at: string
          text: string | null
          update_id: number
        }
        Insert: {
          chat_id?: number | null
          message_id?: number | null
          page_key?: string | null
          raw_update: Json
          received_at?: string
          text?: string | null
          update_id: number
        }
        Update: {
          chat_id?: number | null
          message_id?: number | null
          page_key?: string | null
          raw_update?: Json
          received_at?: string
          text?: string | null
          update_id?: number
        }
        Relationships: []
      }
      telegram_webhook_status: {
        Row: {
          id: string
          info: Json | null
          is_registered: boolean
          last_checked_at: string | null
          last_error: string | null
          last_registered_at: string | null
          updated_at: string
          webhook_url: string | null
        }
        Insert: {
          id?: string
          info?: Json | null
          is_registered?: boolean
          last_checked_at?: string | null
          last_error?: string | null
          last_registered_at?: string | null
          updated_at?: string
          webhook_url?: string | null
        }
        Update: {
          id?: string
          info?: Json | null
          is_registered?: boolean
          last_checked_at?: string | null
          last_error?: string | null
          last_registered_at?: string | null
          updated_at?: string
          webhook_url?: string | null
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
