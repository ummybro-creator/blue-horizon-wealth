import { supabase } from "@/integrations/supabase/client";

export const claimDailyIncome = async (userId: string) => {
  const { data, error } = await supabase.rpc("credit_all_daily_income", {
    p_user_id: userId,
  });

  if (error) throw error;
  return data as number;
};
