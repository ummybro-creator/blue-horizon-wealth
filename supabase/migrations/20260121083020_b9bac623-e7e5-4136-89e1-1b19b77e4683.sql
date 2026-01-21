-- Create function to create withdrawal and deduct balance immediately
CREATE OR REPLACE FUNCTION public.create_withdrawal_with_deduction(p_user_id UUID, p_amount NUMERIC)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance NUMERIC;
  v_withdrawal_id UUID;
BEGIN
  -- Check current balance
  SELECT total_balance INTO v_current_balance
  FROM public.wallets
  WHERE user_id = p_user_id;
  
  IF v_current_balance IS NULL OR v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;
  
  -- Create withdrawal record
  INSERT INTO public.withdrawals (user_id, amount, status)
  VALUES (p_user_id, p_amount, 'pending')
  RETURNING id INTO v_withdrawal_id;
  
  -- Deduct balance immediately
  UPDATE public.wallets
  SET 
    total_balance = total_balance - p_amount,
    withdrawable_balance = withdrawable_balance - p_amount,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  RETURN v_withdrawal_id;
END;
$$;

-- Update reject_withdrawal to refund the balance
CREATE OR REPLACE FUNCTION public.reject_withdrawal(p_withdrawal_id UUID, p_admin_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_amount NUMERIC;
BEGIN
  -- Get withdrawal details
  SELECT user_id, amount INTO v_user_id, v_amount
  FROM public.withdrawals
  WHERE id = p_withdrawal_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Withdrawal not found or already processed';
  END IF;
  
  -- Update withdrawal status
  UPDATE public.withdrawals
  SET status = 'rejected', processed_at = now(), processed_by = p_admin_id
  WHERE id = p_withdrawal_id;
  
  -- Refund the balance
  UPDATE public.wallets
  SET 
    total_balance = total_balance + v_amount,
    withdrawable_balance = withdrawable_balance + v_amount,
    updated_at = now()
  WHERE user_id = v_user_id;
END;
$$;

-- Update approve_withdrawal (no balance change needed since already deducted)
CREATE OR REPLACE FUNCTION public.approve_withdrawal(p_withdrawal_id UUID, p_admin_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Just update the status (balance already deducted on request)
  UPDATE public.withdrawals
  SET status = 'approved', processed_at = now(), processed_by = p_admin_id
  WHERE id = p_withdrawal_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Withdrawal not found or already processed';
  END IF;
END;
$$;