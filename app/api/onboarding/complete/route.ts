import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.json();
  const { firm_name, admin_name, email, phone, address, city, state,
          pincode, gst_number, bar_council, vertical } = body;

  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "");

  let userId = "";
  let userEmail = "";
  if (token) {
    const { data } = await supabase.auth.getUser(token);
    userId = data?.user?.id || "";
    userEmail = data?.user?.email || "";
  }

  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Create firm
  const slug = (firm_name || "firm").toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Date.now();
  const { data: firm, error: firmErr } = await supabase
    .from("firms")
    .insert([{ name: firm_name, slug, admin_name, email, phone, address, city, state, pincode, gst_number, bar_council }])
    .select()
    .single();

  if (firmErr) return NextResponse.json({ error: firmErr.message }, { status: 500 });

  // Create user record
  const role = vertical === "ca" ? "ca" : "lawyer";
  await supabase.from("users").upsert([{
    id: userId,
    firm_id: firm.id,
    email: userEmail,
    full_name: admin_name,
    role
  }]);

  // Add to firm_members
  await supabase.from("firm_members").upsert([{
    firm_id: firm.id,
    user_id: userId,
    role
  }]);

  // Seed firm billing as free
  await supabase.from("firm_billing").insert([{
    firm_id: firm.id,
    plan: "free",
    status: "active",
    amount_inr: 0
  }]).select();

  return NextResponse.json({ success: true, firm_id: firm.id, vertical });
}
