-- Fix: Add policy for admins to view ALL products (including disabled)
DROP POLICY IF EXISTS "Admins can manage all products" ON public.products;

CREATE POLICY "Admins can view all products"
  ON public.products FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can insert products"
  ON public.products FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete products"
  ON public.products FOR DELETE
  USING (public.is_admin());

-- Reset all wallet balances to 0 (enforce no pre-added money rule)
UPDATE public.wallets 
SET 
  total_balance = 0,
  recharge_balance = 0,
  bonus_balance = 0,
  total_income = 0,
  withdrawable_balance = 0,
  updated_at = now();

-- Generate referral codes for existing users who don't have one
UPDATE public.profiles 
SET referral_code = UPPER(SUBSTR(MD5(id::text || now()::text || random()::text), 1, 8))
WHERE referral_code IS NULL;