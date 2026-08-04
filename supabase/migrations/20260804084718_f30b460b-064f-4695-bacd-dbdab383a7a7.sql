-- 1. Secure team fetch (bypasses per-row profile privacy safely, exposes only limited fields)
CREATE OR REPLACE FUNCTION public.get_my_team()
RETURNS TABLE (
  id uuid,
  name text,
  phone text,
  level int,
  joined_at timestamptz,
  total_recharge numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id,
         COALESCE(NULLIF(p.full_name, ''), 'User') AS name,
         p.phone_number AS phone,
         r.level::int,
         p.created_at AS joined_at,
         COALESCE((
           SELECT SUM(rc.amount) FROM public.recharges rc
           WHERE rc.user_id = p.id AND rc.status = 'approved'
         ), 0) AS total_recharge
  FROM public.referrals r
  JOIN public.profiles p ON p.id = r.referred_id
  WHERE r.referrer_id = auth.uid()
  ORDER BY p.created_at DESC
$$;

GRANT EXECUTE ON FUNCTION public.get_my_team() TO authenticated;

-- 2. Backfill missing level 2 and level 3 referral links
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

-- 3. Make sure the level-1 link always exists for anyone with a referrer
INSERT INTO public.referrals (referrer_id, referred_id, level)
SELECT p.referred_by, p.id, 1
FROM public.profiles p
WHERE p.referred_by IS NOT NULL
ON CONFLICT DO NOTHING;
