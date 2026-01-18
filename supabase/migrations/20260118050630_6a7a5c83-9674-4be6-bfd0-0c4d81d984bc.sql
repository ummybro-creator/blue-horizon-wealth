-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create enum for transaction status
CREATE TYPE public.transaction_status AS ENUM ('pending', 'approved', 'rejected');

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    UNIQUE (user_id, role)
);

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    phone_number TEXT UNIQUE NOT NULL,
    full_name TEXT,
    is_blocked BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create wallets table (all balances start at 0)
CREATE TABLE public.wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    total_balance DECIMAL(12,2) DEFAULT 0 NOT NULL,
    recharge_balance DECIMAL(12,2) DEFAULT 0 NOT NULL,
    bonus_balance DECIMAL(12,2) DEFAULT 0 NOT NULL,
    total_income DECIMAL(12,2) DEFAULT 0 NOT NULL,
    withdrawable_balance DECIMAL(12,2) DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create bank_details table
CREATE TABLE public.bank_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    account_holder_name TEXT,
    bank_name TEXT,
    account_number TEXT,
    ifsc_code TEXT,
    upi_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create recharges table
CREATE TABLE public.recharges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    utr_number TEXT,
    status transaction_status DEFAULT 'pending' NOT NULL,
    timer_started_at TIMESTAMPTZ,
    requested_at TIMESTAMPTZ DEFAULT now(),
    processed_at TIMESTAMPTZ,
    processed_by UUID REFERENCES auth.users(id)
);

-- Create withdrawals table
CREATE TABLE public.withdrawals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    status transaction_status DEFAULT 'pending' NOT NULL,
    requested_at TIMESTAMPTZ DEFAULT now(),
    processed_at TIMESTAMPTZ,
    processed_by UUID REFERENCES auth.users(id)
);

-- Create daily_checkins table
CREATE TABLE public.daily_checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    checked_in_at DATE DEFAULT CURRENT_DATE NOT NULL,
    bonus_amount DECIMAL(12,2) NOT NULL,
    UNIQUE (user_id, checked_in_at)
);

-- Create products table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    image_url TEXT,
    price DECIMAL(12,2) NOT NULL,
    daily_income DECIMAL(12,2) NOT NULL,
    total_income DECIMAL(12,2) NOT NULL,
    duration_days INTEGER NOT NULL,
    category TEXT DEFAULT 'daily' NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    is_special_offer BOOLEAN DEFAULT false,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create investments table
CREATE TABLE public.investments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    invested_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    total_earned DECIMAL(12,2) DEFAULT 0,
    status TEXT DEFAULT 'active' NOT NULL
);

-- Create app_settings table (single row)
CREATE TABLE public.app_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_name TEXT DEFAULT 'Investment App',
    app_logo_url TEXT,
    payment_upi_id TEXT DEFAULT 'example@upi',
    payment_qr_code_url TEXT,
    support_whatsapp TEXT,
    support_email TEXT,
    support_phone TEXT,
    telegram_group_link TEXT,
    checkin_bonus_amount DECIMAL(12,2) DEFAULT 12,
    minimum_withdrawal DECIMAL(12,2) DEFAULT 500,
    minimum_recharge DECIMAL(12,2) DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create sliders table
CREATE TABLE public.sliders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT NOT NULL,
    title TEXT,
    link_url TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recharges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sliders ENABLE ROW LEVEL SECURITY;

-- Create helper function to check admin role (security definer to bypass RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- Create helper function to check if user is blocked
CREATE OR REPLACE FUNCTION public.is_blocked(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_blocked FROM public.profiles WHERE id = _user_id),
    false
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.is_admin());

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid() AND NOT is_blocked);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid() AND NOT is_blocked);

CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING (public.is_admin());

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- RLS Policies for wallets
CREATE POLICY "Users can view own wallet"
ON public.wallets FOR SELECT
TO authenticated
USING (user_id = auth.uid() AND NOT public.is_blocked(user_id));

CREATE POLICY "Admins can view all wallets"
ON public.wallets FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "System can insert wallets"
ON public.wallets FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update wallets"
ON public.wallets FOR UPDATE
TO authenticated
USING (public.is_admin());

-- RLS Policies for bank_details
CREATE POLICY "Users can manage own bank details"
ON public.bank_details FOR ALL
TO authenticated
USING (user_id = auth.uid() AND NOT public.is_blocked(user_id));

CREATE POLICY "Admins can view all bank details"
ON public.bank_details FOR SELECT
TO authenticated
USING (public.is_admin());

-- RLS Policies for recharges
CREATE POLICY "Users can view own recharges"
ON public.recharges FOR SELECT
TO authenticated
USING (user_id = auth.uid() AND NOT public.is_blocked(user_id));

CREATE POLICY "Users can create recharges"
ON public.recharges FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() AND NOT public.is_blocked(user_id));

CREATE POLICY "Users can update own pending recharges"
ON public.recharges FOR UPDATE
TO authenticated
USING (user_id = auth.uid() AND status = 'pending' AND NOT public.is_blocked(user_id));

CREATE POLICY "Admins can manage all recharges"
ON public.recharges FOR ALL
TO authenticated
USING (public.is_admin());

-- RLS Policies for withdrawals
CREATE POLICY "Users can view own withdrawals"
ON public.withdrawals FOR SELECT
TO authenticated
USING (user_id = auth.uid() AND NOT public.is_blocked(user_id));

CREATE POLICY "Users can create withdrawals"
ON public.withdrawals FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() AND NOT public.is_blocked(user_id));

CREATE POLICY "Admins can manage all withdrawals"
ON public.withdrawals FOR ALL
TO authenticated
USING (public.is_admin());

-- RLS Policies for daily_checkins
CREATE POLICY "Users can view own checkins"
ON public.daily_checkins FOR SELECT
TO authenticated
USING (user_id = auth.uid() AND NOT public.is_blocked(user_id));

CREATE POLICY "Users can create checkins"
ON public.daily_checkins FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() AND NOT public.is_blocked(user_id));

CREATE POLICY "Admins can view all checkins"
ON public.daily_checkins FOR SELECT
TO authenticated
USING (public.is_admin());

-- RLS Policies for products (publicly readable)
CREATE POLICY "Anyone can view enabled products"
ON public.products FOR SELECT
USING (is_enabled = true);

CREATE POLICY "Admins can manage all products"
ON public.products FOR ALL
TO authenticated
USING (public.is_admin());

-- RLS Policies for investments
CREATE POLICY "Users can view own investments"
ON public.investments FOR SELECT
TO authenticated
USING (user_id = auth.uid() AND NOT public.is_blocked(user_id));

CREATE POLICY "Users can create investments"
ON public.investments FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() AND NOT public.is_blocked(user_id));

CREATE POLICY "Admins can manage all investments"
ON public.investments FOR ALL
TO authenticated
USING (public.is_admin());

-- RLS Policies for app_settings (publicly readable)
CREATE POLICY "Anyone can view app settings"
ON public.app_settings FOR SELECT
USING (true);

CREATE POLICY "Admins can update app settings"
ON public.app_settings FOR UPDATE
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can insert app settings"
ON public.app_settings FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- RLS Policies for sliders (publicly readable)
CREATE POLICY "Anyone can view active sliders"
ON public.sliders FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage sliders"
ON public.sliders FOR ALL
TO authenticated
USING (public.is_admin());

-- Create trigger function for auto-creating wallet and profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, phone_number, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.phone, NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  -- Insert wallet with 0 balance
  INSERT INTO public.wallets (user_id, total_balance, recharge_balance, bonus_balance, total_income, withdrawable_balance)
  VALUES (NEW.id, 0, 0, 0, 0, 0);
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at
  BEFORE UPDATE ON public.wallets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bank_details_updated_at
  BEFORE UPDATE ON public.bank_details
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_app_settings_updated_at
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default app settings
INSERT INTO public.app_settings (
  app_name,
  payment_upi_id,
  support_whatsapp,
  support_email,
  support_phone,
  telegram_group_link,
  checkin_bonus_amount,
  minimum_withdrawal,
  minimum_recharge
) VALUES (
  'Fortune FMCG',
  'fortunefmcg@upi',
  '+91 9876543210',
  'support@fortunefmcg.com',
  '+91 9876543210',
  'https://t.me/fortunefmcg',
  12,
  500,
  100
);

-- Insert sample products
INSERT INTO public.products (name, image_url, price, daily_income, total_income, duration_days, category, is_special_offer, description) VALUES
('Ashirvaad Atta 10kg', '/placeholder.svg', 500, 20, 400, 20, 'daily', false, 'Premium quality wheat flour'),
('Fortune Rice Bran Oil 5L', '/placeholder.svg', 1000, 40, 1200, 30, 'daily', true, 'Heart-healthy cooking oil'),
('Tata Salt 1kg', '/placeholder.svg', 2000, 80, 2400, 30, 'daily', false, 'Iodized salt for daily use'),
('Aashirvaad Multigrain Atta 5kg', '/placeholder.svg', 5000, 200, 6000, 30, 'vip', true, 'Healthy multigrain flour'),
('Fortune Sunflower Oil 15L', '/placeholder.svg', 10000, 400, 16000, 40, 'vip', false, 'Bulk cooking oil for commercial use'),
('Daawat Basmati Rice 25kg', '/placeholder.svg', 25000, 1000, 40000, 40, 'vip', true, 'Premium basmati rice');