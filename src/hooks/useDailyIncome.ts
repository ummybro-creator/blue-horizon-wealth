import { supabase } from "@/integrations/supabase/client";

export const creditDailyIncome = async (userId: string) => {
  const today = new Date().toISOString().split("T")[0];

  // active investments
  const { data: investments } = await supabase
    .from("investments")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active");

  if (!investments || investments.length === 0) return;

  for (const inv of investments) {
    // already credited today
    if (inv.last_credited_date === today) continue;

    // investment expired
    if (new Date(inv.end_date) < new Date()) {
      await supabase
        .from("investments")
        .update({ status: "expired" })
        .eq("id", inv.id);
      continue;
    }

    // credit balance
    await supabase.rpc("increment_balance", {
      uid: userId,
      amount: inv.daily_income,
    });

    // update last credited date
    await supabase
      .from("investments")
      .update({ last_credited_date: today })
      .eq("id", inv.id);
  }
};
