import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const COST_PER_1K_TOKENS_INR = 0.08; // approx Groq llama cost

export async function logAiUsage({
  feature,
  model,
  tokens_used,
  firm_id,
  user_id,
}: {
  feature: string;
  model: string;
  tokens_used: number;
  firm_id?: string;
  user_id?: string;
}) {
  try {
    const cost_inr = (tokens_used / 1000) * COST_PER_1K_TOKENS_INR;
    await supabase.from("ai_usage_log").insert([{
      feature,
      model,
      tokens_used,
      cost_inr,
      firm_id: firm_id || "00000000-0000-0000-0000-000000000001",
      user_id: user_id || null,
    }]);
  } catch (e) {
    // Never break the main flow if logging fails
    console.error("AI log error:", e);
  }
}
