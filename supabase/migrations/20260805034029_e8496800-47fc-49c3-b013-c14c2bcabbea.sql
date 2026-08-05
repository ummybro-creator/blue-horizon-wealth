ALTER TABLE public.app_settings
  ADD COLUMN IF NOT EXISTS auto_approve_recharge boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS auto_approve_max_amount numeric NOT NULL DEFAULT 50000,
  ADD COLUMN IF NOT EXISTS utr_length integer NOT NULL DEFAULT 12;

ALTER TABLE public.recharges
  ADD COLUMN IF NOT EXISTS auto_verified boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS recharges_utr_number_unique
  ON public.recharges (utr_number)
  WHERE utr_number IS NOT NULL AND status <> 'rejected';