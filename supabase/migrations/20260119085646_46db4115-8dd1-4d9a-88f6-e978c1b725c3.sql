-- Update add_bonus to only add to bonus_balance and total_balance, NOT withdrawable
-- This enforces that bonus balance (including check-in) is NOT withdrawable
CREATE OR REPLACE FUNCTION public.add_bonus(p_user_id uuid, p_amount numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.wallets
  SET 
    bonus_balance = bonus_balance + p_amount,
    total_balance = total_balance + p_amount,
    -- Bonus is NOT added to withdrawable_balance
    updated_at = now()
  WHERE user_id = p_user_id;
END;
$$;