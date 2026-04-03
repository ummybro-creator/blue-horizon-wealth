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

    // Verify admin from JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || serviceKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    // Check admin role
    const { data: roleData } = await supabase.from("user_roles").select("role").eq("user_id", user.id).in("role", ["admin", "super_admin"]).maybeSingle();
    if (!roleData) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: corsHeaders });

    const url = new URL(req.url);
    const action = url.searchParams.get("action");
    const body = req.method === "POST" ? await req.json() : {};

    let result: any = null;

    switch (action) {
      // ===== DASHBOARD =====
      case "dashboard_stats": {
        const { data } = await supabase.rpc("get_dashboard_stats");
        result = data;
        break;
      }
      case "revenue_chart": {
        const { data } = await supabase.rpc("get_revenue_chart", { p_days: body.days || 30 });
        result = data;
        break;
      }

      // ===== WALLET ADJUSTMENT =====
      case "adjust_wallet": {
        await supabase.rpc("adjust_wallet", {
          p_admin_id: user.id,
          p_user_id: body.user_id,
          p_amount: body.amount,
          p_reason: body.reason || "Manual adjustment",
        });
        result = { success: true };
        break;
      }

      // ===== NOTIFICATIONS =====
      case "send_notification": {
        const { error } = await supabase.from("notifications").insert({
          user_id: body.user_id || null, // null = broadcast
          title: body.title,
          message: body.message,
          type: body.type || "info",
        });
        if (error) throw error;
        await supabase.rpc("log_admin_action", {
          p_admin_id: user.id, p_action: "send_notification",
          p_details: { title: body.title, target: body.user_id || "all" },
        });
        result = { success: true };
        break;
      }

      // ===== SUPPORT TICKETS =====
      case "list_tickets": {
        const { data } = await supabase.from("support_tickets").select("*, profiles:user_id(full_name, phone_number)").order("created_at", { ascending: false });
        result = data;
        break;
      }
      case "reply_ticket": {
        const { error } = await supabase.from("support_tickets").update({
          admin_reply: body.reply,
          status: body.status || "replied",
          replied_by: user.id,
          updated_at: new Date().toISOString(),
        }).eq("id", body.ticket_id);
        if (error) throw error;
        result = { success: true };
        break;
      }

      // ===== ADMIN LOGS =====
      case "admin_logs": {
        const { data } = await supabase.from("admin_logs").select("*").order("created_at", { ascending: false }).limit(body.limit || 100);
        result = data;
        break;
      }

      // ===== TRANSACTION LEDGER =====
      case "transaction_ledger": {
        let query = supabase.from("transaction_ledger").select("*").order("created_at", { ascending: false }).limit(body.limit || 200);
        if (body.user_id) query = query.eq("user_id", body.user_id);
        if (body.type) query = query.eq("type", body.type);
        const { data } = await query;
        result = data;
        break;
      }

      // ===== FRAUD DETECTION =====
      case "detect_fraud": {
        // Find users sharing same device/IP
        const { data: devices } = await supabase.from("user_devices").select("ip_address, device_id, user_id");
        const ipMap: Record<string, string[]> = {};
        const deviceMap: Record<string, string[]> = {};
        (devices || []).forEach((d: any) => {
          if (d.ip_address) { ipMap[d.ip_address] = ipMap[d.ip_address] || []; ipMap[d.ip_address].push(d.user_id); }
          if (d.device_id) { deviceMap[d.device_id] = deviceMap[d.device_id] || []; deviceMap[d.device_id].push(d.user_id); }
        });
        const suspiciousIps = Object.entries(ipMap).filter(([, users]) => new Set(users).size > 1);
        const suspiciousDevices = Object.entries(deviceMap).filter(([, users]) => new Set(users).size > 1);
        result = { suspicious_ips: suspiciousIps, suspicious_devices: suspiciousDevices };
        break;
      }

      // ===== SYSTEM SETTINGS =====
      case "get_settings": {
        const { data } = await supabase.from("app_settings").select("*").limit(1).maybeSingle();
        result = data;
        break;
      }
      case "update_settings": {
        const { data: existing } = await supabase.from("app_settings").select("id").limit(1).maybeSingle();
        if (existing) {
          await supabase.from("app_settings").update(body.settings).eq("id", existing.id);
        } else {
          await supabase.from("app_settings").insert(body.settings);
        }
        await supabase.rpc("log_admin_action", {
          p_admin_id: user.id, p_action: "update_settings",
          p_details: body.settings,
        });
        result = { success: true };
        break;
      }

      // ===== FAKE ACTIVITY =====
      case "fake_activity": {
        const names = ["Rahul S.", "Priya M.", "Amit K.", "Sneha R.", "Vikram P.", "Anita D.", "Raj T.", "Meena L.", "Kiran J.", "Deepak N."];
        const types = ["withdrawal", "recharge"];
        const activities = Array.from({ length: 20 }, () => ({
          name: names[Math.floor(Math.random() * names.length)],
          type: types[Math.floor(Math.random() * types.length)],
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
