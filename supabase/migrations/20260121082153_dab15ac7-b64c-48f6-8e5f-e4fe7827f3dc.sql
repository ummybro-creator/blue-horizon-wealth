-- Update Level 3 commission from 3% to 2%
CREATE OR REPLACE FUNCTION public.approve_recharge(p_recharge_id uuid, p_admin_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  
  -- Apply referral commissions (Level 1: 30%, Level 2: 5%, Level 3: 2%)
  FOR v_referrer_id, v_level IN 
    SELECT referrer_id, level FROM public.referrals WHERE referred_id = v_user_id
  LOOP
    CASE v_level
      WHEN 1 THEN v_commission_rate := 0.30;
      WHEN 2 THEN v_commission_rate := 0.05;
      WHEN 3 THEN v_commission_rate := 0.02;
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
$function$;