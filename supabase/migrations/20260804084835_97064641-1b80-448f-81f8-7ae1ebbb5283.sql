ALTER TABLE public.referrals DROP CONSTRAINT IF EXISTS referrals_referred_id_key;

CREATE UNIQUE INDEX IF NOT EXISTS referrals_unique_referrer_referred_level
  ON public.referrals (referrer_id, referred_id, level);

INSERT INTO public.referrals (referrer_id, referred_id, level)
SELECT p2.referred_by, p1.id, 2
FROM public.profiles p1
JOIN public.profiles p2 ON p2.id = p1.referred_by
WHERE p1.referred_by IS NOT NULL AND p2.referred_by IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO public.referrals (referrer_id, referred_id, level)
SELECT p3.referred_by, p1.id, 3
FROM public.profiles p1
JOIN public.profiles p2 ON p2.id = p1.referred_by
JOIN public.profiles p3 ON p3.id = p2.referred_by
WHERE p1.referred_by IS NOT NULL AND p2.referred_by IS NOT NULL AND p3.referred_by IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO public.referrals (referrer_id, referred_id, level)
SELECT p.referred_by, p.id, 1
FROM public.profiles p
WHERE p.referred_by IS NOT NULL
ON CONFLICT DO NOTHING;
