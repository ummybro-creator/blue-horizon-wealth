-- 1. Lock down add_bonus so no user can inflate a wallet
REVOKE EXECUTE ON FUNCTION public.add_bonus(uuid, numeric) FROM anon, authenticated, PUBLIC;

CREATE OR REPLACE FUNCTION public.add_bonus(p_user_id uuid, p_amount numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Invalid amount';
  END IF;
  UPDATE public.wallets
  SET bonus_balance = bonus_balance + p_amount,
      total_balance = total_balance + p_amount,
      updated_at = now()
  WHERE user_id = p_user_id;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.add_bonus(uuid, numeric) FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.add_bonus(uuid, numeric) TO service_role;

-- 2. Server-authoritative daily check-in (amount can no longer come from the client)
CREATE OR REPLACE FUNCTION public.perform_checkin()
RETURNS TABLE (day_number int, bonus_amount numeric, new_balance numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user uuid := auth.uid();
  v_today date := (now() AT TIME ZONE 'Asia/Kolkata')::date;
  v_last_date date;
  v_last_day int;
  v_day int;
  v_amount numeric;
  v_rewards numeric[] := ARRAY[5, 7, 9, 10, 12, 15, 20];
  v_balance numeric;
  v_checkin_id uuid;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF EXISTS (SELECT 1 FROM public.daily_checkins WHERE user_id = v_user AND checked_in_at = v_today) THEN
    RAISE EXCEPTION 'Already checked in today';
  END IF;

  SELECT checked_in_at INTO v_last_date
  FROM public.daily_checkins
  WHERE user_id = v_user
  ORDER BY checked_in_at DESC
  LIMIT 1;

  IF v_last_date = v_today - 1 THEN
    SELECT count(*)::int INTO v_last_day
    FROM public.daily_checkins
    WHERE user_id = v_user AND checked_in_at > v_today - 8;
    v_day := (v_last_day % 7) + 1;
  ELSE
    v_day := 1;
  END IF;

  v_amount := v_rewards[v_day];

  INSERT INTO public.daily_checkins (user_id, checked_in_at, bonus_amount)
  VALUES (v_user, v_today, v_amount)
  RETURNING id INTO v_checkin_id;

  UPDATE public.wallets
  SET bonus_balance = bonus_balance + v_amount,
      total_balance = total_balance + v_amount,
      updated_at = now()
  WHERE user_id = v_user
  RETURNING total_balance INTO v_balance;

  INSERT INTO public.transaction_ledger (user_id, type, amount, balance_after, reference_id, description)
  VALUES (v_user, 'bonus', v_amount, COALESCE(v_balance, 0), v_checkin_id, 'Daily check-in reward (Day ' || v_day || ')');

  RETURN QUERY SELECT v_day, v_amount, COALESCE(v_balance, 0);
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.perform_checkin() FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.perform_checkin() TO authenticated, service_role;

-- 3. Prevent clients from writing check-in rows directly (amount tampering)
REVOKE INSERT, UPDATE, DELETE ON public.daily_checkins FROM anon, authenticated;
DROP POLICY IF EXISTS "Users can create their own checkins" ON public.daily_checkins;
DROP POLICY IF EXISTS "Users can insert own checkins" ON public.daily_checkins;

-- 4. Stop anonymous scraping of business payment credentials
DROP POLICY IF EXISTS "Anyone can view app settings" ON public.app_settings;
CREATE POLICY "Authenticated users can view app settings"
ON public.app_settings FOR SELECT TO authenticated USING (true);
REVOKE SELECT ON public.app_settings FROM anon;