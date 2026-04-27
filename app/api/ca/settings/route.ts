import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getAuth(req: Request) {
  const token = (req.headers.get("authorization") || "").replace("Bearer ", "");
  if (!token) return { error: "Unauthorized" };
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return { error: "Unauthorized" };

  const { data: userData } = await supabase
    .from("users").select("firm_id, is_firm_admin, role").eq("id", user.id).single();
  const { data: firmMember } = await supabase
    .from("firm_members").select("role").eq("user_id", user.id).single();

  const isFirmAdmin = userData?.is_firm_admin || firmMember?.role === "firm_admin" || userData?.role === "admin";
  return { user, userData, isFirmAdmin, firm_id: userData?.firm_id };
}

export async function GET(req: Request) {
  const { error, isFirmAdmin, firm_id } = await getAuth(req);
  if (error) return NextResponse.json({ error }, { status: 401 });

  const { data, error: dbErr } = await supabase
    .from("firms").select("*").eq("id", firm_id).single();
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });

  if (!isFirmAdmin) {
    return NextResponse.json({ name: data.name, city: data.city, state: data.state, is_firm_admin: false });
  }
  return NextResponse.json({ ...data, is_firm_admin: true });
}

export async function POST(req: Request) {
  const { error, isFirmAdmin, firm_id } = await getAuth(req);
  if (error) return NextResponse.json({ error }, { status: 401 });
  if (!isFirmAdmin) return NextResponse.json({ error: "Only firm admins can update settings" }, { status: 403 });

  const body = await req.json();
  const { name, address, city, state, pincode, phone, email, gst_number, admin_name } = body;

  const { data, error: dbErr } = await supabase
    .from("firms")
    .update({ name, address, city, state, pincode, phone, email, gst_number, admin_name, updated_at: new Date().toISOString() })
    .eq("id", firm_id)
    .select().single();

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json(data);
}
