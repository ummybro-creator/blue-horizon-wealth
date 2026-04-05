
-- Table to track per-referral deposit bonus milestones (₹350 system)
CREATE TABLE public.referral_deposit_bonuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referred_id uuid NOT NULL,
  deposit_number integer NOT NULL,
  bonus_amount numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(referrer_id, referred_id, deposit_number)
);

ALTER TABLE public.referral_deposit_bonuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage referral deposit bonuses" ON public.referral_deposit_bonuses
  FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Users can view own referral deposit bonuses" ON public.referral_deposit_bonuses
  FOR SELECT TO authenticated USING (referrer_id = auth.uid());

-- Add withdrawal deposit requirement columns to app_settings
ALTER TABLE public.app_settings 
  ADD COLUMN IF NOT EXISTS referral_deposit_bonus_enabled boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS withdrawal_deposit_multiplier integer DEFAULT 3;
