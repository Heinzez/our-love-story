export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
