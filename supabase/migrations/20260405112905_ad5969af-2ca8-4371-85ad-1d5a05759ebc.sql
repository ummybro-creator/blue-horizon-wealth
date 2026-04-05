
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
  v_settings RECORD;
  v_deposit_count INTEGER;
  v_bonus_amount DECIMAL;
  v_bonus_tiers DECIMAL[] := ARRAY[20, 30, 50, 100, 150];
BEGIN
  SELECT user_id, amount INTO v_user_id, v_amount
  FROM public.recharges
  WHERE id = p_recharge_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Recharge not found or already processed';
  END IF;
  
  SELECT * INTO v_settings FROM public.app_settings LIMIT 1;
  
  UPDATE public.recharges
  SET status = 'approved', processed_at = now(), processed_by = p_admin_id
  WHERE id = p_recharge_id;
  
  UPDATE public.wallets
  SET 
    recharge_balance = recharge_balance + v_amount,
    total_balance = total_balance + v_amount,
    withdrawable_balance = withdrawable_balance + v_amount,
    updated_at = now()
  WHERE user_id = v_user_id;
  
  PERFORM public.record_ledger(v_user_id, 'recharge', v_amount, p_recharge_id, 'Recharge approved');
  
  -- Apply referral commissions if enabled
  IF COALESCE(v_settings.referral_enabled, true) THEN
    FOR v_referrer_id, v_level IN 
      SELECT referrer_id, level FROM public.referrals WHERE referred_id = v_user_id
    LOOP
      CASE v_level
        WHEN 1 THEN v_commission_rate := COALESCE(v_settings.level1_commission, 13) / 100.0;
        WHEN 2 THEN v_commission_rate := COALESCE(v_settings.level2_commission, 5) / 100.0;
        WHEN 3 THEN v_commission_rate := COALESCE(v_settings.level3_commission, 2) / 100.0;
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
        
        PERFORM public.record_ledger(v_referrer_id, 'referral_bonus', v_commission, p_recharge_id, 
          'Level ' || v_level || ' referral commission');
      END IF;
      
      -- Level 1 extra deposit bonus (₹350 system)
      IF v_level = 1 AND COALESCE(v_settings.referral_deposit_bonus_enabled, true) THEN
        -- Count approved deposits for this referred user
        SELECT COUNT(*) INTO v_deposit_count
        FROM public.recharges
        WHERE user_id = v_user_id AND status = 'approved';
        
        -- Check if this deposit number qualifies for a bonus (1-5)
        IF v_deposit_count <= 5 THEN
          v_bonus_amount := v_bonus_tiers[v_deposit_count];
          
          -- Insert bonus (unique constraint prevents duplicates)
          BEGIN
            INSERT INTO public.referral_deposit_bonuses (referrer_id, referred_id, deposit_number, bonus_amount)
            VALUES (v_referrer_id, v_user_id, v_deposit_count, v_bonus_amount);
            
            -- Credit bonus to referrer wallet
            UPDATE public.wallets
            SET 
              total_income = total_income + v_bonus_amount,
              total_balance = total_balance + v_bonus_amount,
              withdrawable_balance = withdrawable_balance + v_bonus_amount,
              updated_at = now()
            WHERE user_id = v_referrer_id;
            
            PERFORM public.record_ledger(v_referrer_id, 'referral_deposit_bonus', v_bonus_amount, p_recharge_id, 
              'Deposit #' || v_deposit_count || ' bonus from referral');
          EXCEPTION WHEN unique_violation THEN
            -- Already claimed, skip
            NULL;
          END;
        END IF;
      END IF;
    END LOOP;
  END IF;
  
  PERFORM public.log_admin_action(p_admin_id, 'approve_recharge', 'recharge', p_recharge_id,
    jsonb_build_object('amount', v_amount, 'user_id', v_user_id));
END;
$function$;
