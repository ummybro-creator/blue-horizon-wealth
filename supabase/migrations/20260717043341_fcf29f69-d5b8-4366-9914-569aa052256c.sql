CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_referral_code TEXT;
  v_referrer_id UUID;
  v_referred_by TEXT;
  v_phone TEXT;
  v_signup_bonus NUMERIC := 12;
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

  -- Grant new user a signup bonus (bonus balance only, not withdrawable)
  INSERT INTO public.wallets (user_id, total_balance, recharge_balance, bonus_balance, total_income, withdrawable_balance)
  VALUES (NEW.id, v_signup_bonus, 0, v_signup_bonus, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Log signup bonus in ledger
  BEGIN
    PERFORM public.record_ledger(NEW.id, 'signup_bonus', v_signup_bonus, NULL, 'Welcome signup bonus');
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

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
$function$;