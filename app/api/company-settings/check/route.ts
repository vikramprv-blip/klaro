import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "");

  let userId = "";
  if (token) {
    const { data } = await supabase.auth.getUser(token);
    userId = data?.user?.id || "";
  }

  if (!userId) return NextResponse.json({ hasSettings: false });

  const { data: user } = await supabase
    .from("users")
    .select("firm_id")
    .eq("id", userId)
    .single();

  if (!user?.firm_id) return NextResponse.json({ hasSettings: false });

  const { data: firm } = await supabase
    .from("firms")
    .select("name, admin_name")
    .eq("id", user.firm_id)
    .single();

  // Has settings if firm has a name set
  return NextResponse.json({ hasSettings: !!(firm?.name) });
}
