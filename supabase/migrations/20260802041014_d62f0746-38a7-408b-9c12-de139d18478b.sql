CREATE OR REPLACE FUNCTION internal.create_investment(p_user_id uuid, p_product_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_product_price numeric;
  v_product_duration integer;
  v_recharge_balance numeric;
  v_investment_id uuid;
BEGIN
  SELECT price, duration_days INTO v_product_price, v_product_duration
  FROM public.products
  WHERE id = p_product_id AND is_enabled = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product not found or disabled';
  END IF;

  -- Only the deposited/recharged balance may be spent on products
  SELECT recharge_balance INTO v_recharge_balance
  FROM public.wallets
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_recharge_balance IS NULL OR v_recharge_balance < v_product_price THEN
    RAISE EXCEPTION 'Insufficient recharge balance. Products can only be purchased with your deposited balance.';
  END IF;

  UPDATE public.wallets
  SET
    recharge_balance = recharge_balance - v_product_price,
    total_balance = GREATEST(0, total_balance - v_product_price),
    withdrawable_balance = GREATEST(0, withdrawable_balance - v_product_price),
    updated_at = now()
  WHERE user_id = p_user_id;

  INSERT INTO public.investments (
    user_id, product_id, invested_amount, invested_at, expires_at, status, total_earned, last_credited_at
  ) VALUES (
    p_user_id, p_product_id, v_product_price, now(),
    now() + (v_product_duration || ' days')::interval, 'active', 0, NULL
  )
  RETURNING id INTO v_investment_id;

  RETURN v_investment_id;
END;
$function$;

CREATE OR REPLACE FUNCTION internal.create_withdrawal_with_deduction(p_user_id uuid, p_amount numeric)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_current_balance NUMERIC;
  v_withdrawal_id UUID;
  v_has_vip BOOLEAN;
BEGIN
  -- Server-side gate: withdrawals require a purchased VIP plan above 700
  SELECT EXISTS (
    SELECT 1 FROM public.investments
    WHERE user_id = p_user_id AND invested_amount > 700
  ) INTO v_has_vip;

  IF NOT v_has_vip THEN
    RAISE EXCEPTION 'WITHDRAWAL_LOCKED: Withdrawals are available only after purchasing a VIP plan worth more than ₹700.';
  END IF;

  SELECT total_balance INTO v_current_balance
  FROM public.wallets
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_current_balance IS NULL OR v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  INSERT INTO public.withdrawals (user_id, amount, status)
  VALUES (p_user_id, p_amount, 'pending')
  RETURNING id INTO v_withdrawal_id;

  UPDATE public.wallets
  SET
    total_balance = total_balance - p_amount,
    withdrawable_balance = GREATEST(0, withdrawable_balance - p_amount),
    updated_at = now()
  WHERE user_id = p_user_id;

  RETURN v_withdrawal_id;
END;
$function$;