import { supabase } from "@/integrations/supabase/client";

export const claimDailyIncome = async (userId: string) => {
  const today = new Date().toISOString().split("T")[0];

  const { data: investments, error } = await supabase
    .from("investments")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active");

  if (error) throw error;
  if (!investments || investments.length === 0) {
    throw new Error("No active investment");
  }

  for (const inv of investments) {
    // already claimed today
    if (inv.last_credited_date === today) {
      throw new Error("Already claimed today");
    }

    // expired investment
    if (new Date(inv.end_date) < new Date()) {
      await supabase
        .from("investments")
        .update({ status: "expired" })
        .eq("id", inv.id);
      continue;
    }

    // credit wallet
    await supabase.rpc("increment_balance", {
      uid: userId,
      amount: inv.daily_income,
    });

    // mark today claimed
    await supabase
      .from("investments")
      .update({ last_credited_date: today })
      .eq("id", inv.id);
  }

  return true;
};
