GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wallets TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.wallets TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bank_details TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recharges TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.withdrawals TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_checkins TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.investments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.referrals TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.support_tickets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transaction_ledger TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_devices TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.referral_deposit_bonuses TO authenticated;
GRANT ALL ON public.bank_details TO service_role;
GRANT ALL ON public.recharges TO service_role;
GRANT ALL ON public.withdrawals TO service_role;
GRANT ALL ON public.daily_checkins TO service_role;
GRANT ALL ON public.investments TO service_role;
GRANT ALL ON public.referrals TO service_role;
GRANT ALL ON public.notifications TO service_role;
GRANT ALL ON public.support_tickets TO service_role;
GRANT ALL ON public.transaction_ledger TO service_role;
GRANT ALL ON public.user_devices TO service_role;
GRANT ALL ON public.referral_deposit_bonuses TO service_role;
GRANT SELECT ON public.products TO anon, authenticated;
GRANT SELECT ON public.app_settings TO anon, authenticated;
GRANT SELECT ON public.sliders TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sliders TO authenticated;
GRANT ALL ON public.products TO service_role;
GRANT ALL ON public.app_settings TO service_role;
GRANT ALL ON public.sliders TO service_role;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('super_admin'::public.app_role, 'admin'::public.app_role, 'sub_admin'::public.app_role)
  )
$$;

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
  v_phone TEXT;
BEGIN
  v_phone := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'phone', ''),
    NULLIF(NEW.phone, ''),
    NULLIF(split_part(NEW.email, '@', 1), ''),
    NEW.id::text
  );

  LOOP
    v_referral_code := UPPER(SUBSTR(MD5(NEW.id::text || now()::text || random()::text), 1, 8));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = v_referral_code);
  END LOOP;

  v_referred_by := NULLIF(NEW.raw_user_meta_data->>'referral_code', '');

  IF v_referred_by IS NOT NULL THEN
    SELECT id INTO v_referrer_id
    FROM public.profiles
    WHERE referral_code = v_referred_by;
  END IF;

  INSERT INTO public.profiles (id, phone_number, full_name, referral_code, referred_by)
  VALUES (
    NEW.id,
    v_phone,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    v_referral_code,
    v_referrer_id
  )
  ON CONFLICT (id) DO UPDATE SET
    phone_number = EXCLUDED.phone_number,
    full_name = EXCLUDED.full_name,
    updated_at = now();

  INSERT INTO public.wallets (user_id, total_balance, recharge_balance, bonus_balance, total_income, withdrawable_balance)
  VALUES (NEW.id, 0, 0, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  IF v_referrer_id IS NOT NULL THEN
    INSERT INTO public.referrals (referrer_id, referred_id, level)
    VALUES (v_referrer_id, NEW.id, 1)
    ON CONFLICT DO NOTHING;

    INSERT INTO public.referrals (referrer_id, referred_id, level)
    SELECT p.referred_by, NEW.id, 2
    FROM public.profiles p
    WHERE p.id = v_referrer_id AND p.referred_by IS NOT NULL
    ON CONFLICT DO NOTHING;

    INSERT INTO public.referrals (referrer_id, referred_id, level)
    SELECT p2.referred_by, NEW.id, 3
    FROM public.profiles p1
    JOIN public.profiles p2 ON p1.referred_by = p2.id
    WHERE p1.id = v_referrer_id AND p2.referred_by IS NOT NULL
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;