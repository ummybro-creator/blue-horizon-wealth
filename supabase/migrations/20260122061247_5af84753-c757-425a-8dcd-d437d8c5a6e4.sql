-- Add invested_amount and last_credited_at to investments table
ALTER TABLE public.investments 
ADD COLUMN IF NOT EXISTS invested_amount numeric NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_credited_at date;

-- Create function to handle investment with balance check and deduction
CREATE OR REPLACE FUNCTION public.create_investment(
  p_user_id uuid,
  p_product_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_product_price numeric;
  v_product_duration integer;
  v_daily_income numeric;
  v_current_balance numeric;
  v_investment_id uuid;
BEGIN
  -- Get product details
  SELECT price, duration_days, daily_income INTO v_product_price, v_product_duration, v_daily_income
  FROM public.products
  WHERE id = p_product_id AND is_enabled = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product not found or disabled';
  END IF;
  
  -- Check user balance
  SELECT total_balance INTO v_current_balance
  FROM public.wallets
  WHERE user_id = p_user_id;
  
  IF v_current_balance IS NULL OR v_current_balance < v_product_price THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;
  
  -- Deduct balance from wallet
  UPDATE public.wallets
  SET 
    total_balance = total_balance - v_product_price,
    recharge_balance = GREATEST(0, recharge_balance - v_product_price),
    withdrawable_balance = GREATEST(0, withdrawable_balance - v_product_price),
    updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Create investment record
  INSERT INTO public.investments (
    user_id, 
    product_id, 
    invested_amount,
    invested_at, 
    expires_at, 
    status,
    total_earned,
    last_credited_at
  )
  VALUES (
    p_user_id,
    p_product_id,
    v_product_price,
    now(),
    now() + (v_product_duration || ' days')::interval,
    'active',
    0,
    NULL
  )
  RETURNING id INTO v_investment_id;
  
  RETURN v_investment_id;
END;
$$;

-- Create function to credit daily income for a specific investment
CREATE OR REPLACE FUNCTION public.credit_daily_income(p_investment_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_investment RECORD;
  v_daily_income numeric;
  v_user_id uuid;
BEGIN
  -- Get investment details
  SELECT i.*, p.daily_income 
  INTO v_investment
  FROM public.investments i
  JOIN public.products p ON i.product_id = p.id
  WHERE i.id = p_investment_id 
    AND i.status = 'active'
    AND i.expires_at > now();
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Check if already credited today
  IF v_investment.last_credited_at = CURRENT_DATE THEN
    RETURN false;
  END IF;
  
  v_daily_income := v_investment.daily_income;
  v_user_id := v_investment.user_id;
  
  -- Credit daily income to wallet
  UPDATE public.wallets
  SET 
    total_income = total_income + v_daily_income,
    total_balance = total_balance + v_daily_income,
    withdrawable_balance = withdrawable_balance + v_daily_income,
    updated_at = now()
  WHERE user_id = v_user_id;
  
  -- Update investment record
  UPDATE public.investments
  SET 
    total_earned = total_earned + v_daily_income,
    last_credited_at = CURRENT_DATE
  WHERE id = p_investment_id;
  
  RETURN true;
END;
$$;

-- Create function to credit all pending daily incomes for a user
CREATE OR REPLACE FUNCTION public.credit_all_daily_income(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_investment RECORD;
  v_credited_count integer := 0;
BEGIN
  FOR v_investment IN 
    SELECT i.id
    FROM public.investments i
    WHERE i.user_id = p_user_id
      AND i.status = 'active'
      AND i.expires_at > now()
      AND (i.last_credited_at IS NULL OR i.last_credited_at < CURRENT_DATE)
  LOOP
    IF public.credit_daily_income(v_investment.id) THEN
      v_credited_count := v_credited_count + 1;
    END IF;
  END LOOP;
  
  RETURN v_credited_count;
END;
$$;