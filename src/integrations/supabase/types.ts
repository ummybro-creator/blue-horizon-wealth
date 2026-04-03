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
      admin_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          app_logo_url: string | null
          app_name: string | null
          checkin_bonus_amount: number | null
          created_at: string | null
          deposit_bonus_percent: number | null
          earnings_paused: boolean | null
          global_earning_cap: number | null
          id: string
          level1_commission: number | null
          level2_commission: number | null
          level3_commission: number | null
          maximum_withdrawal: number | null
          minimum_recharge: number | null
          minimum_withdrawal: number | null
          payment_qr_code_url: string | null
          payment_upi_id: string | null
          per_user_earning_limit: number | null
          recharge_enabled: boolean | null
          referral_enabled: boolean | null
          roi_multiplier: number | null
          signup_bonus: number | null
          support_email: string | null
          support_phone: string | null
          support_whatsapp: string | null
          telegram_group_link: string | null
          updated_at: string | null
          withdraw_charge_percent: number | null
          withdraw_delay_hours: number | null
          withdraw_enabled: boolean | null
        }
        Insert: {
          app_logo_url?: string | null
          app_name?: string | null
          checkin_bonus_amount?: number | null
          created_at?: string | null
          deposit_bonus_percent?: number | null
          earnings_paused?: boolean | null
          global_earning_cap?: number | null
          id?: string
          level1_commission?: number | null
          level2_commission?: number | null
          level3_commission?: number | null
          maximum_withdrawal?: number | null
          minimum_recharge?: number | null
          minimum_withdrawal?: number | null
          payment_qr_code_url?: string | null
          payment_upi_id?: string | null
          per_user_earning_limit?: number | null
          recharge_enabled?: boolean | null
          referral_enabled?: boolean | null
          roi_multiplier?: number | null
          signup_bonus?: number | null
          support_email?: string | null
          support_phone?: string | null
          support_whatsapp?: string | null
          telegram_group_link?: string | null
          updated_at?: string | null
          withdraw_charge_percent?: number | null
          withdraw_delay_hours?: number | null
          withdraw_enabled?: boolean | null
        }
        Update: {
          app_logo_url?: string | null
          app_name?: string | null
          checkin_bonus_amount?: number | null
          created_at?: string | null
          deposit_bonus_percent?: number | null
          earnings_paused?: boolean | null
          global_earning_cap?: number | null
          id?: string
          level1_commission?: number | null
          level2_commission?: number | null
          level3_commission?: number | null
          maximum_withdrawal?: number | null
          minimum_recharge?: number | null
          minimum_withdrawal?: number | null
          payment_qr_code_url?: string | null
          payment_upi_id?: string | null
          per_user_earning_limit?: number | null
          recharge_enabled?: boolean | null
          referral_enabled?: boolean | null
          roi_multiplier?: number | null
          signup_bonus?: number | null
          support_email?: string | null
          support_phone?: string | null
          support_whatsapp?: string | null
          telegram_group_link?: string | null
          updated_at?: string | null
          withdraw_charge_percent?: number | null
          withdraw_delay_hours?: number | null
          withdraw_enabled?: boolean | null
        }
        Relationships: []
      }
      bank_details: {
        Row: {
          account_holder_name: string | null
          account_number: string | null
          bank_name: string | null
          created_at: string | null
          id: string
          ifsc_code: string | null
          updated_at: string | null
          upi_id: string | null
          user_id: string
        }
        Insert: {
          account_holder_name?: string | null
          account_number?: string | null
          bank_name?: string | null
          created_at?: string | null
          id?: string
          ifsc_code?: string | null
          updated_at?: string | null
          upi_id?: string | null
          user_id: string
        }
        Update: {
          account_holder_name?: string | null
          account_number?: string | null
          bank_name?: string | null
          created_at?: string | null
          id?: string
          ifsc_code?: string | null
          updated_at?: string | null
          upi_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      daily_checkins: {
        Row: {
          bonus_amount: number
          checked_in_at: string
          id: string
          user_id: string
        }
        Insert: {
          bonus_amount: number
          checked_in_at?: string
          id?: string
          user_id: string
        }
        Update: {
          bonus_amount?: number
          checked_in_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      investments: {
        Row: {
          expires_at: string
          id: string
          invested_amount: number
          invested_at: string | null
          last_credited_at: string | null
          product_id: string
          status: string
          total_earned: number | null
          user_id: string
        }
        Insert: {
          expires_at: string
          id?: string
          invested_amount?: number
          invested_at?: string | null
          last_credited_at?: string | null
          product_id: string
          status?: string
          total_earned?: number | null
          user_id: string
        }
        Update: {
          expires_at?: string
          id?: string
          invested_amount?: number
          invested_at?: string | null
          last_credited_at?: string | null
          product_id?: string
          status?: string
          total_earned?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          title: string
          type?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string
          created_at: string | null
          daily_income: number
          description: string | null
          duration_days: number
          id: string
          image_url: string | null
          is_enabled: boolean | null
          is_special_offer: boolean | null
          name: string
          price: number
          total_income: number
          updated_at: string | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          daily_income: number
          description?: string | null
          duration_days: number
          id?: string
          image_url?: string | null
          is_enabled?: boolean | null
          is_special_offer?: boolean | null
          name: string
          price: number
          total_income: number
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          daily_income?: number
          description?: string | null
          duration_days?: number
          id?: string
          image_url?: string | null
          is_enabled?: boolean | null
          is_special_offer?: boolean | null
          name?: string
          price?: number
          total_income?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          is_blocked: boolean | null
          phone_number: string
          referral_code: string | null
          referred_by: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
          is_blocked?: boolean | null
          phone_number: string
          referral_code?: string | null
          referred_by?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          is_blocked?: boolean | null
          phone_number?: string
          referral_code?: string | null
          referred_by?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      recharges: {
        Row: {
          amount: number
          id: string
          processed_at: string | null
          processed_by: string | null
          requested_at: string | null
          status: Database["public"]["Enums"]["transaction_status"]
          timer_started_at: string | null
          user_id: string
          utr_number: string | null
        }
        Insert: {
          amount: number
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          requested_at?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          timer_started_at?: string | null
          user_id: string
          utr_number?: string | null
        }
        Update: {
          amount?: number
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          requested_at?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          timer_started_at?: string | null
          user_id?: string
          utr_number?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string | null
          id: string
          level: number
          referred_id: string
          referrer_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          level?: number
          referred_id: string
          referrer_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          level?: number
          referred_id?: string
          referrer_id?: string
        }
        Relationships: []
      }
      revenue_logs: {
        Row: {
          created_at: string
          id: string
          log_date: string
          profit: number
          total_bonus: number
          total_commission: number
          total_recharge: number
          total_withdraw: number
          user_count: number
        }
        Insert: {
          created_at?: string
          id?: string
          log_date?: string
          profit?: number
          total_bonus?: number
          total_commission?: number
          total_recharge?: number
          total_withdraw?: number
          user_count?: number
        }
        Update: {
          created_at?: string
          id?: string
          log_date?: string
          profit?: number
          total_bonus?: number
          total_commission?: number
          total_recharge?: number
          total_withdraw?: number
          user_count?: number
        }
        Relationships: []
      }
      sliders: {
        Row: {
          created_at: string | null
          id: string
          image_url: string
          is_active: boolean | null
          link_url: string | null
          sort_order: number | null
          title: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url: string
          is_active?: boolean | null
          link_url?: string | null
          sort_order?: number | null
          title?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          link_url?: string | null
          sort_order?: number | null
          title?: string | null
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          admin_reply: string | null
          created_at: string
          id: string
          message: string
          replied_by: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_reply?: string | null
          created_at?: string
          id?: string
          message: string
          replied_by?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_reply?: string | null
          created_at?: string
          id?: string
          message?: string
          replied_by?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transaction_ledger: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_devices: {
        Row: {
          created_at: string
          device_id: string | null
          id: string
          ip_address: string | null
          last_login_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          device_id?: string | null
          id?: string
          ip_address?: string | null
          last_login_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          device_id?: string | null
          id?: string
          ip_address?: string | null
          last_login_at?: string
          user_agent?: string | null
          user_id?: string
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
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          bonus_balance: number
          created_at: string | null
          id: string
          recharge_balance: number
          total_balance: number
          total_income: number
          updated_at: string | null
          user_id: string
          withdrawable_balance: number
        }
        Insert: {
          bonus_balance?: number
          created_at?: string | null
          id?: string
          recharge_balance?: number
          total_balance?: number
          total_income?: number
          updated_at?: string | null
          user_id: string
          withdrawable_balance?: number
        }
        Update: {
          bonus_balance?: number
          created_at?: string | null
          id?: string
          recharge_balance?: number
          total_balance?: number
          total_income?: number
          updated_at?: string | null
          user_id?: string
          withdrawable_balance?: number
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          amount: number
          id: string
          processed_at: string | null
          processed_by: string | null
          requested_at: string | null
          status: Database["public"]["Enums"]["transaction_status"]
          user_id: string
        }
        Insert: {
          amount: number
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          requested_at?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          user_id: string
        }
        Update: {
          amount?: number
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          requested_at?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_bonus: {
        Args: { p_amount: number; p_user_id: string }
        Returns: undefined
      }
      adjust_wallet: {
        Args: {
          p_admin_id: string
          p_amount: number
          p_reason?: string
          p_user_id: string
        }
        Returns: undefined
      }
      approve_recharge: {
        Args: { p_admin_id: string; p_recharge_id: string }
        Returns: undefined
      }
      approve_withdrawal: {
        Args: { p_admin_id: string; p_withdrawal_id: string }
        Returns: undefined
      }
      create_investment: {
        Args: { p_product_id: string; p_user_id: string }
        Returns: string
      }
      create_withdrawal_with_deduction: {
        Args: { p_amount: number; p_user_id: string }
        Returns: string
      }
      credit_all_daily_income: { Args: { p_user_id: string }; Returns: number }
      credit_daily_income: {
        Args: { p_investment_id: string }
        Returns: boolean
      }
      get_dashboard_stats: { Args: never; Returns: Json }
      get_revenue_chart: {
        Args: { p_days?: number }
        Returns: {
          log_date: string
          profit_amount: number
          recharge_amount: number
          withdraw_amount: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_blocked: { Args: { _user_id: string }; Returns: boolean }
      log_admin_action: {
        Args: {
          p_action: string
          p_admin_id: string
          p_details?: Json
          p_target_id?: string
          p_target_type?: string
        }
        Returns: undefined
      }
      record_ledger: {
        Args: {
          p_amount: number
          p_description?: string
          p_reference_id?: string
          p_type: string
          p_user_id: string
        }
        Returns: undefined
      }
      reject_recharge: {
        Args: { p_admin_id: string; p_recharge_id: string }
        Returns: undefined
      }
      reject_withdrawal: {
        Args: { p_admin_id: string; p_withdrawal_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user" | "super_admin" | "sub_admin"
      transaction_status: "pending" | "approved" | "rejected"
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
      app_role: ["admin", "user", "super_admin", "sub_admin"],
      transaction_status: ["pending", "approved", "rejected"],
    },
  },
} as const
