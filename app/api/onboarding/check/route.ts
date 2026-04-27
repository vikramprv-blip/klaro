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

  // Check if user exists in our users table
  const { data: user } = await supabase
    .from("users")
    .select("id, role, firm_id")
    .eq("id", userId)
    .single();

  if (!user) {
    return NextResponse.json({ hasOrg: false, vertical: "lawyer" });
  }

  return NextResponse.json({
    hasOrg: true,
    vertical: user.role === "admin" ? "admin" : user.role === "ca" ? "ca" : "lawyer",
    firmId: user.firm_id,
  });
}
