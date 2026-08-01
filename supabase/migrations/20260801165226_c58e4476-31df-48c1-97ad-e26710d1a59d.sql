CREATE SCHEMA IF NOT EXISTS internal;
REVOKE ALL ON SCHEMA internal FROM anon, authenticated, PUBLIC;

-- Move the raw money/admin logic out of the public API schema
ALTER FUNCTION public.adjust_wallet(uuid, uuid, numeric, text) SET SCHEMA internal;
ALTER FUNCTION public.approve_recharge(uuid, uuid) SET SCHEMA internal;
ALTER FUNCTION public.reject_recharge(uuid, uuid) SET SCHEMA internal;
ALTER FUNCTION public.approve_withdrawal(uuid, uuid) SET SCHEMA internal;
ALTER FUNCTION public.reject_withdrawal(uuid, uuid) SET SCHEMA internal;
ALTER FUNCTION public.create_investment(uuid, uuid) SET SCHEMA internal;
ALTER FUNCTION public.create_withdrawal_with_deduction(uuid, numeric) SET SCHEMA internal;
ALTER FUNCTION public.credit_all_daily_income(uuid) SET SCHEMA internal;
ALTER FUNCTION public.credit_daily_income(uuid) SET SCHEMA internal;
ALTER FUNCTION public.get_dashboard_stats() SET SCHEMA internal;
ALTER FUNCTION public.get_revenue_chart(integer) SET SCHEMA internal;

-- Internal-only bookkeeping helpers stay where callers expect them, but clients can't call them
REVOKE EXECUTE ON FUNCTION public.record_ledger(uuid, text, numeric, uuid, text) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_admin_action(uuid, text, text, uuid, jsonb) FROM anon, authenticated, PUBLIC;

-- Admin check helper
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('admin'::app_role, 'super_admin'::app_role, 'sub_admin'::app_role)
  )
$$;
REVOKE EXECUTE ON FUNCTION public.is_staff() FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated, service_role;

-- ===== Guarded admin wrappers =====
CREATE OR REPLACE FUNCTION public.adjust_wallet(p_admin_id uuid, p_user_id uuid, p_amount numeric, p_reason text DEFAULT 'Manual adjustment'::text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_staff() THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  PERFORM internal.adjust_wallet(auth.uid(), p_user_id, p_amount, p_reason);
END; $$;

CREATE OR REPLACE FUNCTION public.approve_recharge(p_recharge_id uuid, p_admin_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_staff() THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  PERFORM internal.approve_recharge(p_recharge_id, auth.uid());
END; $$;

CREATE OR REPLACE FUNCTION public.reject_recharge(p_recharge_id uuid, p_admin_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_staff() THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  PERFORM internal.reject_recharge(p_recharge_id, auth.uid());
END; $$;

CREATE OR REPLACE FUNCTION public.approve_withdrawal(p_withdrawal_id uuid, p_admin_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_staff() THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  PERFORM internal.approve_withdrawal(p_withdrawal_id, auth.uid());
END; $$;

CREATE OR REPLACE FUNCTION public.reject_withdrawal(p_withdrawal_id uuid, p_admin_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_staff() THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  PERFORM internal.reject_withdrawal(p_withdrawal_id, auth.uid());
END; $$;

CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_staff() THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  RETURN internal.get_dashboard_stats();
END; $$;

CREATE OR REPLACE FUNCTION public.get_revenue_chart(p_days integer)
RETURNS TABLE(log_date date, recharge_amount numeric, withdraw_amount numeric, profit_amount numeric)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_staff() THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  RETURN QUERY SELECT * FROM internal.get_revenue_chart(p_days);
END; $$;

-- ===== Guarded user wrappers (own account only) =====
CREATE OR REPLACE FUNCTION public.create_investment(p_user_id uuid, p_product_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  RETURN internal.create_investment(auth.uid(), p_product_id);
END; $$;

CREATE OR REPLACE FUNCTION public.create_withdrawal_with_deduction(p_user_id uuid, p_amount numeric)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  RETURN internal.create_withdrawal_with_deduction(auth.uid(), p_amount);
END; $$;

CREATE OR REPLACE FUNCTION public.credit_all_daily_income(p_user_id uuid)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  RETURN internal.credit_all_daily_income(auth.uid());
END; $$;

CREATE OR REPLACE FUNCTION public.credit_daily_income(p_investment_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.investments WHERE id = p_investment_id AND user_id = auth.uid()
  ) THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  RETURN internal.credit_daily_income(p_investment_id);
END; $$;

DO $$
DECLARE fn text;
BEGIN
  FOR fn IN SELECT p.oid::regprocedure::text FROM pg_proc p
            JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'internal'
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM anon, authenticated, PUBLIC', fn);
  END LOOP;
END $$;

DO $$
DECLARE fn text;
BEGIN
  FOR fn IN SELECT p.oid::regprocedure::text FROM pg_proc p
            JOIN pg_namespace n ON n.oid = p.pronamespace
            WHERE n.nspname = 'public' AND p.proname IN (
              'adjust_wallet','approve_recharge','reject_recharge','approve_withdrawal','reject_withdrawal',
              'get_dashboard_stats','get_revenue_chart','create_investment','create_withdrawal_with_deduction',
              'credit_all_daily_income','credit_daily_income')
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM anon, PUBLIC', fn);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated, service_role', fn);
  END LOOP;
END $$;