import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || serviceKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const url = new URL(req.url);
    const action = url.searchParams.get("action");
    const body = req.method === "POST" ? await req.json() : {};

    let result: any = null;

    switch (action) {
      // ===== NOTIFICATIONS =====
      case "notifications": {
        const { data } = await supabase.from("notifications")
          .select("*")
          .or(`user_id.eq.${user.id},user_id.is.null`)
          .order("created_at", { ascending: false })
          .limit(50);
        result = data;
        break;
      }
      case "mark_read": {
        await supabase.from("notifications").update({ is_read: true }).eq("id", body.notification_id).eq("user_id", user.id);
        result = { success: true };
        break;
      }

      // ===== SUPPORT TICKETS =====
      case "create_ticket": {
        const { data, error } = await supabase.from("support_tickets").insert({
          user_id: user.id,
          subject: body.subject,
          message: body.message,
        }).select().single();
        if (error) throw error;
        result = data;
        break;
      }
      case "my_tickets": {
        const { data } = await supabase.from("support_tickets")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        result = data;
        break;
      }

      // ===== DEVICE TRACKING =====
      case "register_device": {
        await supabase.from("user_devices").upsert({
          user_id: user.id,
          device_id: body.device_id || null,
          ip_address: body.ip_address || null,
          user_agent: body.user_agent || null,
          last_login_at: new Date().toISOString(),
        }, { onConflict: "user_id" }).select();
        result = { success: true };
        break;
      }

      // ===== TRANSACTION HISTORY =====
      case "ledger": {
        const { data } = await supabase.from("transaction_ledger")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(body.limit || 50);
        result = data;
        break;
      }

      // ===== FAKE ACTIVITY (public) =====
      case "fake_activity": {
        const names = ["Rahul S.", "Priya M.", "Amit K.", "Sneha R.", "Vikram P.", "Anita D.", "Raj T.", "Meena L.", "Kiran J.", "Deepak N.", "Pooja A.", "Suresh B."];
        const activities = Array.from({ length: 15 }, () => ({
          name: names[Math.floor(Math.random() * names.length)],
          type: Math.random() > 0.5 ? "withdrawal" : "recharge",
          amount: Math.floor(Math.random() * 49000 + 1000),
          time: `${Math.floor(Math.random() * 59 + 1)}m ago`,
          masked_id: `****${Math.floor(Math.random() * 9000 + 1000)}`,
        }));
        result = activities;
        break;
      }

      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers: corsHeaders });
    }

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500, headers: corsHeaders });
  }
});
