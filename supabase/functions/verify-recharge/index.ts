import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization') ?? ''
    if (!authHeader.startsWith('Bearer ')) return json({ error: 'Unauthorized' }, 401)

    const url = Deno.env.get('SUPABASE_URL')!
    const anon = Deno.env.get('SUPABASE_ANON_KEY')!
    const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Validate the caller's JWT
    const userClient = createClient(url, anon, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: userData, error: userErr } = await userClient.auth.getUser()
    if (userErr || !userData?.user) return json({ error: 'Unauthorized' }, 401)
    const userId = userData.user.id

    // Validate input
    let body: { recharge_id?: unknown; utr_number?: unknown }
    try {
      body = await req.json()
    } catch {
      return json({ error: 'Invalid JSON body' }, 400)
    }
    const rechargeId = typeof body.recharge_id === 'string' ? body.recharge_id.trim() : ''
    const rawUtr = typeof body.utr_number === 'string' ? body.utr_number.trim() : ''
    const utr = rawUtr.replace(/\s+/g, '').toUpperCase()

    const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRe.test(rechargeId)) return json({ error: 'Invalid recharge reference' }, 400)
    if (!utr) return json({ error: 'Please enter your UTR / UPI Reference number' }, 400)

    const admin = createClient(url, service, { auth: { persistSession: false } })

    const { data: settings } = await admin
      .from('app_settings')
      .select('auto_approve_recharge, auto_approve_max_amount, utr_length')
      .limit(1)
      .maybeSingle()

    const utrLength = Number(settings?.utr_length ?? 12)
    const autoApprove = settings?.auto_approve_recharge !== false
    const maxAuto = Number(settings?.auto_approve_max_amount ?? 50000)

    // UPI UTRs are numeric (12 digits by default)
    if (!new RegExp(`^\\d{${utrLength}}$`).test(utr)) {
      return json(
        { error: `Invalid UTR. It must be exactly ${utrLength} digits — check your UPI app receipt.` },
        400,
      )
    }
    if (/^(\d)\1+$/.test(utr)) return json({ error: 'Invalid UTR number' }, 400)

    // Load the deposit and confirm ownership
    const { data: recharge, error: rErr } = await admin
      .from('recharges')
      .select('id, user_id, amount, status, utr_number')
      .eq('id', rechargeId)
      .maybeSingle()

    if (rErr || !recharge) return json({ error: 'Deposit request not found' }, 404)
    if (recharge.user_id !== userId) return json({ error: 'Unauthorized' }, 403)
    if (recharge.status !== 'pending') {
      return json({ error: `This deposit is already ${recharge.status}` }, 409)
    }

    // Reject reused UTRs (also protected by a unique index)
    const { data: dupe } = await admin
      .from('recharges')
      .select('id')
      .eq('utr_number', utr)
      .neq('status', 'rejected')
      .neq('id', rechargeId)
      .limit(1)
      .maybeSingle()
    if (dupe) {
      return json({ error: 'This UTR number has already been used for another deposit.' }, 409)
    }

    // Save the UTR
    const { error: upErr } = await admin
      .from('recharges')
      .update({ utr_number: utr })
      .eq('id', rechargeId)
      .eq('status', 'pending')
    if (upErr) {
      if ((upErr as { code?: string }).code === '23505') {
        return json({ error: 'This UTR number has already been used for another deposit.' }, 409)
      }
      return json({ error: 'Could not save your UTR. Please try again.' }, 500)
    }

    const amount = Number(recharge.amount)
    const eligible = autoApprove && amount > 0 && amount <= maxAuto

    if (!eligible) {
      return json({
        status: 'pending',
        message: 'UTR received. Your deposit is queued for manual review.',
      })
    }

    // Instant approval (credits wallet, bonuses and referral commissions)
    const { error: apErr } = await admin.rpc('approve_recharge', {
      p_recharge_id: rechargeId,
      p_admin_id: userId,
    })

    if (apErr) {
      return json({
        status: 'pending',
        message: 'UTR received. Your deposit is queued for manual review.',
      })
    }

    await admin.from('recharges').update({ auto_verified: true }).eq('id', rechargeId)

    return json({
      status: 'approved',
      amount,
      message: 'Payment verified! Your balance has been credited instantly.',
    })
  } catch (_e) {
    return json({ error: 'Something went wrong. Please try again.' }, 500)
  }
})
