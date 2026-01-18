-- Create function to add bonus to wallet
CREATE OR REPLACE FUNCTION public.add_bonus(p_user_id UUID, p_amount DECIMAL)
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
    updated_at = now()
  WHERE user_id = p_user_id;
END;
$$;

-- Create function to process recharge approval (admin only)
CREATE OR REPLACE FUNCTION public.approve_recharge(p_recharge_id UUID, p_admin_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_amount DECIMAL;
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
  
  -- Add to wallet
  UPDATE public.wallets
  SET 
    recharge_balance = recharge_balance + v_amount,
    total_balance = total_balance + v_amount,
    withdrawable_balance = withdrawable_balance + v_amount,
    updated_at = now()
  WHERE user_id = v_user_id;
END;
$$;

-- Create function to reject recharge
CREATE OR REPLACE FUNCTION public.reject_recharge(p_recharge_id UUID, p_admin_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.recharges
  SET status = 'rejected', processed_at = now(), processed_by = p_admin_id
  WHERE id = p_recharge_id AND status = 'pending';
END;
$$;

-- Create function to approve withdrawal
CREATE OR REPLACE FUNCTION public.approve_withdrawal(p_withdrawal_id UUID, p_admin_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_amount DECIMAL;
  v_withdrawable DECIMAL;
BEGIN
  -- Get withdrawal details
  SELECT user_id, amount INTO v_user_id, v_amount
  FROM public.withdrawals
  WHERE id = p_withdrawal_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Withdrawal not found or already processed';
  END IF;
  
  -- Check sufficient balance
  SELECT withdrawable_balance INTO v_withdrawable
  FROM public.wallets
  WHERE user_id = v_user_id;
  
  IF v_withdrawable < v_amount THEN
    RAISE EXCEPTION 'Insufficient withdrawable balance';
  END IF;
  
  -- Update withdrawal status
  UPDATE public.withdrawals
  SET status = 'approved', processed_at = now(), processed_by = p_admin_id
  WHERE id = p_withdrawal_id;
  
  -- Deduct from wallet
  UPDATE public.wallets
  SET 
    withdrawable_balance = withdrawable_balance - v_amount,
    total_balance = total_balance - v_amount,
    updated_at = now()
  WHERE user_id = v_user_id;
END;
$$;

-- Create function to reject withdrawal
CREATE OR REPLACE FUNCTION public.reject_withdrawal(p_withdrawal_id UUID, p_admin_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.withdrawals
  SET status = 'rejected', processed_at = now(), processed_by = p_admin_id
  WHERE id = p_withdrawal_id AND status = 'pending';
END;
$$;