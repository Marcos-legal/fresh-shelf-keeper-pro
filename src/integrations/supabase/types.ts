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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      contagens_estoque: {
        Row: {
          created_at: string
          data_contagem: string
          empresa_id: string
          id: string
          observacoes: string | null
          produto_id: string
          quantidade: number
          quantidade_extra: number
          quantidade_total: number
          responsavel: string | null
          unidade_quantidade_extra: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_contagem?: string
          empresa_id: string
          id?: string
          observacoes?: string | null
          produto_id: string
          quantidade?: number
          quantidade_extra?: number
          quantidade_total?: number
          responsavel?: string | null
          unidade_quantidade_extra?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          data_contagem?: string
          empresa_id?: string
          id?: string
          observacoes?: string | null
          produto_id?: string
          quantidade?: number
          quantidade_extra?: number
          quantidade_total?: number
          responsavel?: string | null
          unidade_quantidade_extra?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contagens_estoque_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contagens_estoque_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos_estoque"
            referencedColumns: ["id"]
          },
        ]
      }
      empresa_invites: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          empresa_id: string
          id: string
          invited_by: string | null
          role: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          empresa_id: string
          id?: string
          invited_by?: string | null
          role?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          empresa_id?: string
          id?: string
          invited_by?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "empresa_invites_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      empresa_members: {
        Row: {
          created_at: string
          empresa_id: string
          id: string
          role: Database["public"]["Enums"]["empresa_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          empresa_id: string
          id?: string
          role?: Database["public"]["Enums"]["empresa_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          empresa_id?: string
          id?: string
          role?: Database["public"]["Enums"]["empresa_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "empresa_members_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          created_at: string
          id: string
          nome: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome?: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_events: {
        Row: {
          created_at: string
          custo_snapshot: number | null
          empresa_id: string
          id: string
          motivo: string | null
          product_id: number | null
          product_lote: string | null
          product_nome: string | null
          tipo: Database["public"]["Enums"]["product_event_type"]
          user_id: string | null
        }
        Insert: {
          created_at?: string
          custo_snapshot?: number | null
          empresa_id: string
          id?: string
          motivo?: string | null
          product_id?: number | null
          product_lote?: string | null
          product_nome?: string | null
          tipo: Database["public"]["Enums"]["product_event_type"]
          user_id?: string | null
        }
        Update: {
          created_at?: string
          custo_snapshot?: number | null
          empresa_id?: string
          id?: string
          motivo?: string | null
          product_id?: number | null
          product_lote?: string | null
          product_nome?: string | null
          tipo?: Database["public"]["Enums"]["product_event_type"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_events_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_events_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand: string
          created_at: string | null
          days_valid: number | null
          empresa_id: string
          expiry_date: string | null
          expiry_date_entered: boolean | null
          id: number
          lot: string
          manufacture_date: string | null
          manufacture_date_entered: boolean | null
          name: string
          opening_date: string | null
          preco_custo: number | null
          responsible: string
          status: string
          storage: string
          use_by_date: string | null
          user_id: string
        }
        Insert: {
          brand?: string
          created_at?: string | null
          days_valid?: number | null
          empresa_id: string
          expiry_date?: string | null
          expiry_date_entered?: boolean | null
          id?: never
          lot?: string
          manufacture_date?: string | null
          manufacture_date_entered?: boolean | null
          name?: string
          opening_date?: string | null
          preco_custo?: number | null
          responsible?: string
          status?: string
          storage?: string
          use_by_date?: string | null
          user_id: string
        }
        Update: {
          brand?: string
          created_at?: string | null
          days_valid?: number | null
          empresa_id?: string
          expiry_date?: string | null
          expiry_date_entered?: boolean | null
          id?: never
          lot?: string
          manufacture_date?: string | null
          manufacture_date_entered?: boolean | null
          name?: string
          opening_date?: string | null
          preco_custo?: number | null
          responsible?: string
          status?: string
          storage?: string
          use_by_date?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos_estoque: {
        Row: {
          created_at: string
          empresa_id: string
          id: string
          nome: string
          quantidade_por_unidade: number
          unidade_conteudo: string
          unidade_medida: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          empresa_id: string
          id?: string
          nome: string
          quantidade_por_unidade?: number
          unidade_conteudo: string
          unidade_medida: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          empresa_id?: string
          id?: string
          nome?: string
          quantidade_por_unidade?: number
          unidade_conteudo?: string
          unidade_medida?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "produtos_estoque_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string | null
        }
        Insert: {
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string | null
        }
        Update: {
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          empresa_id: string | null
          id: string
          mp_subscription_id: string | null
          payment_id: string | null
          payment_provider: string | null
          plan: string | null
          status: string
          trial_end: string
          trial_start: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          empresa_id?: string | null
          id?: string
          mp_subscription_id?: string | null
          payment_id?: string | null
          payment_provider?: string | null
          plan?: string | null
          status?: string
          trial_end?: string
          trial_start?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          empresa_id?: string | null
          id?: string
          mp_subscription_id?: string | null
          payment_id?: string | null
          payment_provider?: string | null
          plan?: string | null
          status?: string
          trial_end?: string
          trial_start?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
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
      whatsapp_alerts_config: {
        Row: {
          created_at: string
          daily_hour: number
          empresa_id: string
          enabled: boolean
          from_number: string | null
          id: string
          last_sent_at: string | null
          phone_e164: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          daily_hour?: number
          empresa_id: string
          enabled?: boolean
          from_number?: string | null
          id?: string
          last_sent_at?: string | null
          phone_e164?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          daily_hour?: number
          empresa_id?: string
          enabled?: boolean
          from_number?: string | null
          id?: string
          last_sent_at?: string | null
          phone_e164?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_alerts_config_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: true
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_pending_invites: { Args: never; Returns: number }
      get_effective_subscription: {
        Args: never
        Returns: {
          current_period_end: string
          is_inherited: boolean
          mp_subscription_id: string
          owner_user_id: string
          payment_id: string
          payment_provider: string
          plan: string
          status: string
          trial_end: string
          trial_start: string
        }[]
      }
      get_empresa_ativa: { Args: { _user: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      invite_empresa_member: {
        Args: { _email: string; _empresa: string; _role?: string }
        Returns: Json
      }
      is_empresa_admin: {
        Args: { _empresa: string; _user: string }
        Returns: boolean
      }
      is_empresa_member: {
        Args: { _empresa: string; _user: string }
        Returns: boolean
      }
      is_empresa_owner: {
        Args: { _empresa: string; _user: string }
        Returns: boolean
      }
      list_empresa_invites: {
        Args: { _empresa: string }
        Returns: {
          created_at: string
          email: string
          id: string
          role: string
        }[]
      }
      list_empresa_members: {
        Args: { _empresa: string }
        Returns: {
          created_at: string
          email: string
          first_name: string
          last_name: string
          role: string
          user_id: string
        }[]
      }
      remove_empresa_member: {
        Args: { _empresa: string; _user: string }
        Returns: undefined
      }
      rename_empresa: {
        Args: { _empresa: string; _nome: string }
        Returns: undefined
      }
      update_empresa_member_role: {
        Args: { _empresa: string; _role: string; _user: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      empresa_role: "owner" | "admin" | "staff" | "member"
      product_event_type: "consumido" | "descartado" | "vencido"
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
      empresa_role: ["owner", "admin", "staff", "member"],
      product_event_type: ["consumido", "descartado", "vencido"],
    },
  },
} as const
