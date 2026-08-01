CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    COALESCE(NULLIF(current_setting('request.jwt.claims', true), '')::json->>'role', '') = 'service_role'
    OR EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin'::app_role, 'super_admin'::app_role, 'sub_admin'::app_role)
    )
$$;

CREATE OR REPLACE FUNCTION public.adjust_wallet(p_admin_id uuid, p_user_id uuid, p_amount numeric, p_reason text DEFAULT 'Manual adjustment'::text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_staff() THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  PERFORM internal.adjust_wallet(COALESCE(auth.uid(), p_admin_id), p_user_id, p_amount, p_reason);
END; $$;

CREATE OR REPLACE FUNCTION public.approve_recharge(p_recharge_id uuid, p_admin_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_staff() THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  PERFORM internal.approve_recharge(p_recharge_id, COALESCE(auth.uid(), p_admin_id));
END; $$;

CREATE OR REPLACE FUNCTION public.reject_recharge(p_recharge_id uuid, p_admin_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_staff() THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  PERFORM internal.reject_recharge(p_recharge_id, COALESCE(auth.uid(), p_admin_id));
END; $$;

CREATE OR REPLACE FUNCTION public.approve_withdrawal(p_withdrawal_id uuid, p_admin_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_staff() THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  PERFORM internal.approve_withdrawal(p_withdrawal_id, COALESCE(auth.uid(), p_admin_id));
END; $$;

CREATE OR REPLACE FUNCTION public.reject_withdrawal(p_withdrawal_id uuid, p_admin_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_staff() THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  PERFORM internal.reject_withdrawal(p_withdrawal_id, COALESCE(auth.uid(), p_admin_id));
END; $$;

REVOKE EXECUTE ON FUNCTION public.is_staff() FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated, service_role;