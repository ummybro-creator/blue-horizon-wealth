
-- =============================================
-- ADMIN ACTIVITY LOGS
-- =============================================
CREATE TABLE public.admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view logs" ON public.admin_logs FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can create logs" ON public.admin_logs FOR INSERT TO authenticated WITH CHECK (public.is_admin());

-- =============================================
-- SUPPORT TICKETS
-- =============================================
CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  admin_reply TEXT,
  replied_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can create tickets" ON public.support_tickets FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can view own tickets" ON public.support_tickets FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage tickets" ON public.support_tickets FOR ALL TO authenticated USING (public.is_admin());

-- =============================================
-- NOTIFICATIONS
-- =============================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage notifications" ON public.notifications FOR ALL TO authenticated USING (public.is_admin());

-- =============================================
-- REVENUE LOGS (daily snapshots)
-- =============================================
CREATE TABLE public.revenue_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_recharge NUMERIC NOT NULL DEFAULT 0,
  total_withdraw NUMERIC NOT NULL DEFAULT 0,
  total_bonus NUMERIC NOT NULL DEFAULT 0,
  total_commission NUMERIC NOT NULL DEFAULT 0,
  profit NUMERIC NOT NULL DEFAULT 0,
  user_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(log_date)
);
ALTER TABLE public.revenue_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage revenue logs" ON public.revenue_logs FOR ALL TO authenticated USING (public.is_admin());

-- =============================================
-- USER DEVICES (fraud detection)
-- =============================================
CREATE TABLE public.user_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  device_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  last_login_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own devices" ON public.user_devices FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert devices" ON public.user_devices FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can manage devices" ON public.user_devices FOR ALL TO authenticated USING (public.is_admin());

-- =============================================
-- TRANSACTION LEDGER (complete audit trail)
-- =============================================
CREATE TABLE public.transaction_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  balance_after NUMERIC NOT NULL DEFAULT 0,
  reference_id UUID,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.transaction_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own ledger" ON public.transaction_ledger FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage ledger" ON public.transaction_ledger FOR ALL TO authenticated USING (public.is_admin());

-- =============================================
-- EXPAND APP SETTINGS for system controls
-- =============================================
ALTER TABLE public.app_settings
  ADD COLUMN IF NOT EXISTS withdraw_charge_percent NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS maximum_withdrawal NUMERIC DEFAULT 10000,
  ADD COLUMN IF NOT EXISTS signup_bonus NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS deposit_bonus_percent NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS referral_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS level1_commission NUMERIC DEFAULT 13,
  ADD COLUMN IF NOT EXISTS level2_commission NUMERIC DEFAULT 5,
  ADD COLUMN IF NOT EXISTS level3_commission NUMERIC DEFAULT 2,
  ADD COLUMN IF NOT EXISTS withdraw_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS recharge_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS earnings_paused BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS roi_multiplier NUMERIC DEFAULT 1,
  ADD COLUMN IF NOT EXISTS global_earning_cap NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS per_user_earning_limit NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS withdraw_delay_hours INTEGER DEFAULT 0;
