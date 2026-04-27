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

  if (!userId) {
    return NextResponse.json({ hasOrg: false, vertical: "lawyer" });
  }

  const { data: user } = await supabase
    .from("users")
    .select("id, role, firm_id")
    .eq("id", userId)
    .single();

  if (!user) {
    return NextResponse.json({ hasOrg: false, vertical: "lawyer" });
  }

  // Determine vertical based on role
  let vertical = "lawyer";
  if (user.role === "ca") vertical = "ca";
  else if (user.role === "admin") vertical = "admin";
  else if (user.role === "both") vertical = "both";

  return NextResponse.json({
    hasOrg: true,
    vertical,
    firmId: user.firm_id,
  });
}
