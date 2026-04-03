
-- =============================================
-- LOG ADMIN ACTION
-- =============================================
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_admin_id UUID,
  p_action TEXT,
  p_target_type TEXT DEFAULT NULL,
  p_target_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.admin_logs (admin_id, action, target_type, target_id, details)
  VALUES (p_admin_id, p_action, p_target_type, p_target_id, p_details);
END;
$$;

-- =============================================
-- RECORD LEDGER ENTRY
-- =============================================
CREATE OR REPLACE FUNCTION public.record_ledger(
  p_user_id UUID,
  p_type TEXT,
  p_amount NUMERIC,
  p_reference_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_balance NUMERIC;
BEGIN
  SELECT total_balance INTO v_balance FROM public.wallets WHERE user_id = p_user_id;
  INSERT INTO public.transaction_ledger (user_id, type, amount, balance_after, reference_id, description)
  VALUES (p_user_id, p_type, p_amount, COALESCE(v_balance, 0), p_reference_id, p_description);
END;
$$;

-- =============================================
-- GET DASHBOARD STATS
-- =============================================
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_users', (SELECT count(*) FROM public.profiles),
    'active_users', (SELECT count(DISTINCT user_id) FROM public.investments WHERE status = 'active'),
    'total_deposits', (SELECT COALESCE(sum(amount), 0) FROM public.recharges WHERE status = 'approved'),
    'total_withdrawals', (SELECT COALESCE(sum(amount), 0) FROM public.withdrawals WHERE status = 'approved'),
    'pending_recharges', (SELECT count(*) FROM public.recharges WHERE status = 'pending'),
    'pending_withdrawals', (SELECT count(*) FROM public.withdrawals WHERE status = 'pending'),
    'active_investments', (SELECT count(*) FROM public.investments WHERE status = 'active'),
    'total_bonus_given', (SELECT COALESCE(sum(bonus_balance), 0) FROM public.wallets),
    'total_commission_given', (SELECT COALESCE(sum(total_income), 0) FROM public.wallets),
    'profit', (SELECT COALESCE(sum(amount), 0) FROM public.recharges WHERE status = 'approved') 
              - (SELECT COALESCE(sum(amount), 0) FROM public.withdrawals WHERE status = 'approved')
  ) INTO v_result;
  RETURN v_result;
END;
$$;

-- =============================================
-- GET REVENUE CHART DATA
-- =============================================
CREATE OR REPLACE FUNCTION public.get_revenue_chart(p_days INTEGER DEFAULT 30)
RETURNS TABLE(log_date DATE, recharge_amount NUMERIC, withdraw_amount NUMERIC, profit_amount NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.dt::DATE as log_date,
    COALESCE(r.total, 0) as recharge_amount,
    COALESCE(w.total, 0) as withdraw_amount,
    COALESCE(r.total, 0) - COALESCE(w.total, 0) as profit_amount
  FROM generate_series(CURRENT_DATE - (p_days || ' days')::interval, CURRENT_DATE, '1 day') d(dt)
  LEFT JOIN (
    SELECT requested_at::DATE as dt, sum(amount) as total
    FROM public.recharges WHERE status = 'approved'
    GROUP BY requested_at::DATE
  ) r ON r.dt = d.dt::DATE
  LEFT JOIN (
    SELECT requested_at::DATE as dt, sum(amount) as total
    FROM public.withdrawals WHERE status = 'approved'
    GROUP BY requested_at::DATE
  ) w ON w.dt = d.dt::DATE
  ORDER BY d.dt;
END;
$$;

-- =============================================
-- ADMIN WALLET ADJUSTMENT
-- =============================================
CREATE OR REPLACE FUNCTION public.adjust_wallet(
  p_admin_id UUID,
  p_user_id UUID,
  p_amount NUMERIC,
  p_reason TEXT DEFAULT 'Manual adjustment'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.wallets
  SET 
    total_balance = GREATEST(0, total_balance + p_amount),
    withdrawable_balance = GREATEST(0, withdrawable_balance + p_amount),
    updated_at = now()
  WHERE user_id = p_user_id;

  PERFORM public.record_ledger(p_user_id, 'manual_adjustment', p_amount, NULL, p_reason);
  PERFORM public.log_admin_action(p_admin_id, 'wallet_adjustment', 'user', p_user_id, 
    jsonb_build_object('amount', p_amount, 'reason', p_reason));
END;
$$;

-- =============================================
-- UPDATED APPROVE RECHARGE (configurable commissions + ledger)
-- =============================================
CREATE OR REPLACE FUNCTION public.approve_recharge(p_recharge_id uuid, p_admin_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_amount DECIMAL;
  v_referrer_id UUID;
  v_commission DECIMAL;
  v_level INTEGER;
  v_commission_rate DECIMAL;
  v_settings RECORD;
BEGIN
  SELECT user_id, amount INTO v_user_id, v_amount
  FROM public.recharges
  WHERE id = p_recharge_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Recharge not found or already processed';
  END IF;
  
  -- Get configurable settings
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
  
  -- Record ledger
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
    END LOOP;
  END IF;
  
  -- Log admin action
  PERFORM public.log_admin_action(p_admin_id, 'approve_recharge', 'recharge', p_recharge_id,
    jsonb_build_object('amount', v_amount, 'user_id', v_user_id));
END;
$$;

-- =============================================
-- UPDATED REJECT RECHARGE (with logging)
-- =============================================
CREATE OR REPLACE FUNCTION public.reject_recharge(p_recharge_id uuid, p_admin_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.recharges
  SET status = 'rejected', processed_at = now(), processed_by = p_admin_id
  WHERE id = p_recharge_id AND status = 'pending';
  
  PERFORM public.log_admin_action(p_admin_id, 'reject_recharge', 'recharge', p_recharge_id, '{}'::jsonb);
END;
$$;

-- =============================================
-- UPDATED APPROVE WITHDRAWAL (with ledger + logging)
-- =============================================
CREATE OR REPLACE FUNCTION public.approve_withdrawal(p_withdrawal_id uuid, p_admin_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_amount NUMERIC;
BEGIN
  SELECT user_id, amount INTO v_user_id, v_amount
  FROM public.withdrawals
  WHERE id = p_withdrawal_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Withdrawal not found or already processed';
  END IF;
  
  UPDATE public.withdrawals
  SET status = 'approved', processed_at = now(), processed_by = p_admin_id
  WHERE id = p_withdrawal_id;
  
  PERFORM public.record_ledger(v_user_id, 'withdraw', -v_amount, p_withdrawal_id, 'Withdrawal approved');
  PERFORM public.log_admin_action(p_admin_id, 'approve_withdrawal', 'withdrawal', p_withdrawal_id,
    jsonb_build_object('amount', v_amount, 'user_id', v_user_id));
END;
$$;

-- =============================================
-- UPDATED REJECT WITHDRAWAL (with ledger + logging)
-- =============================================
CREATE OR REPLACE FUNCTION public.reject_withdrawal(p_withdrawal_id uuid, p_admin_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_amount NUMERIC;
BEGIN
  SELECT user_id, amount INTO v_user_id, v_amount
  FROM public.withdrawals
  WHERE id = p_withdrawal_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Withdrawal not found or already processed';
  END IF;
  
  UPDATE public.withdrawals
  SET status = 'rejected', processed_at = now(), processed_by = p_admin_id
  WHERE id = p_withdrawal_id;
  
  -- Refund
  UPDATE public.wallets
  SET 
    total_balance = total_balance + v_amount,
    withdrawable_balance = withdrawable_balance + v_amount,
    updated_at = now()
  WHERE user_id = v_user_id;
  
  PERFORM public.record_ledger(v_user_id, 'withdraw_refund', v_amount, p_withdrawal_id, 'Withdrawal rejected - refund');
  PERFORM public.log_admin_action(p_admin_id, 'reject_withdrawal', 'withdrawal', p_withdrawal_id,
    jsonb_build_object('amount', v_amount, 'user_id', v_user_id));
END;
$$;
