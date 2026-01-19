-- Create referrals table to track user referrals
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  level INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add referral_code to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES auth.users(id);

-- Enable RLS on referrals
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- RLS policies for referrals
CREATE POLICY "Users can view their referrals"
  ON public.referrals FOR SELECT
  USING (referrer_id = auth.uid() AND NOT public.is_blocked(referrer_id));

CREATE POLICY "Admins can manage all referrals"
  ON public.referrals FOR ALL
  USING (public.is_admin());

-- Update the handle_new_user function to generate referral code and track referrals
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referral_code TEXT;
  v_referrer_id UUID;
  v_referred_by TEXT;
BEGIN
  -- Generate unique referral code
  v_referral_code := UPPER(SUBSTR(MD5(NEW.id::text || now()::text), 1, 8));
  
  -- Get referral code from signup metadata
  v_referred_by := NEW.raw_user_meta_data->>'referral_code';
  
  -- Find referrer by their referral code
  IF v_referred_by IS NOT NULL AND v_referred_by != '' THEN
    SELECT id INTO v_referrer_id FROM public.profiles WHERE referral_code = v_referred_by;
  END IF;
  
  -- Insert profile with referral code
  INSERT INTO public.profiles (id, phone_number, full_name, referral_code, referred_by)
  VALUES (
    NEW.id,
    COALESCE(NEW.phone, NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    v_referral_code,
    v_referrer_id
  );
  
  -- Insert wallet with 0 balance (no pre-added money)
  INSERT INTO public.wallets (user_id, total_balance, recharge_balance, bonus_balance, total_income, withdrawable_balance)
  VALUES (NEW.id, 0, 0, 0, 0, 0);
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  -- Create referral chain (up to 3 levels)
  IF v_referrer_id IS NOT NULL THEN
    -- Level 1 referral
    INSERT INTO public.referrals (referrer_id, referred_id, level)
    VALUES (v_referrer_id, NEW.id, 1);
    
    -- Level 2 referral (referrer's referrer)
    INSERT INTO public.referrals (referrer_id, referred_id, level)
    SELECT p.referred_by, NEW.id, 2
    FROM public.profiles p
    WHERE p.id = v_referrer_id AND p.referred_by IS NOT NULL;
    
    -- Level 3 referral (referrer's referrer's referrer)
    INSERT INTO public.referrals (referrer_id, referred_id, level)
    SELECT p2.referred_by, NEW.id, 3
    FROM public.profiles p1
    JOIN public.profiles p2 ON p1.referred_by = p2.id
    WHERE p1.id = v_referrer_id AND p2.referred_by IS NOT NULL;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update approve_recharge to apply referral commissions
CREATE OR REPLACE FUNCTION public.approve_recharge(p_recharge_id uuid, p_admin_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_amount DECIMAL;
  v_referrer_id UUID;
  v_commission DECIMAL;
  v_level INTEGER;
  v_commission_rate DECIMAL;
BEGIN
  -- Get recharge details
  SELECT user_id, amount INTO v_user_id, v_amount
  FROM public.recharges
  WHERE id = p_recharge_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Recharge not found or already processed';
  END IF;
  
  -- Update recharge status
  UPDATE public.recharges
  SET status = 'approved', processed_at = now(), processed_by = p_admin_id
  WHERE id = p_recharge_id;
  
  -- Add to user's wallet
  UPDATE public.wallets
  SET 
    recharge_balance = recharge_balance + v_amount,
    total_balance = total_balance + v_amount,
    withdrawable_balance = withdrawable_balance + v_amount,
    updated_at = now()
  WHERE user_id = v_user_id;
  
  -- Apply referral commissions (Level 1: 30%, Level 2: 5%, Level 3: 3%)
  FOR v_referrer_id, v_level IN 
    SELECT referrer_id, level FROM public.referrals WHERE referred_id = v_user_id
  LOOP
    CASE v_level
      WHEN 1 THEN v_commission_rate := 0.30;
      WHEN 2 THEN v_commission_rate := 0.05;
      WHEN 3 THEN v_commission_rate := 0.03;
      ELSE v_commission_rate := 0;
    END CASE;
    
    v_commission := v_amount * v_commission_rate;
    
    IF v_commission > 0 THEN
      UPDATE public.wallets
      SET 
        total_income = total_income + v_commission,
        total_balance = total_balance + v_commission,
        withdrawable_balance = withdrawable_balance + v_commission,
        updated_at = now()
      WHERE user_id = v_referrer_id;
    END IF;
  END LOOP;
END;
$$;