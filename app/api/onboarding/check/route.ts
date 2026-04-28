import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "");

  if (!token) return NextResponse.json({ hasOrg: false, vertical: "ca" });

  const { data: authData } = await supabase.auth.getUser(token);
  const userId = authData?.user?.id;
  const email = authData?.user?.email;

  if (!userId) return NextResponse.json({ hasOrg: false, vertical: "ca" });

  const { data: user } = await supabase
    .from("users")
    .select("id, role, firm_id, is_firm_admin")
    .eq("id", userId)
    .single();

  if (user) {
    let vertical = "ca";
    if (user.role === "lawyer") vertical = "lawyer";
    else if (user.role === "admin") vertical = "admin";
    else if (user.role === "both") vertical = "both";
    return NextResponse.json({
      hasOrg: true,
      vertical,
      firmId: user.firm_id,
      isFirmAdmin: user.is_firm_admin || false,
    });
  }

  // Auto-provision from firm_members
  const { data: member } = await supabase
    .from("firm_members")
    .select("firm_id, role")
    .eq("user_id", userId)
    .single();

  const DEMO_FIRM = "00000000-0000-0000-0000-000000000001";
  const role = member?.role === "lawyer" ? "lawyer" : "ca";
  const firmId = member?.firm_id || DEMO_FIRM;

  await supabase.from("users").upsert([{
    id: userId, email, role, firm_id: firmId, is_firm_admin: false,
  }]);

  return NextResponse.json({ hasOrg: true, vertical: role, firmId });
}
