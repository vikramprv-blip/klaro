import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  const cookieStore = await cookies();
  const authClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: userData } = await supabase
    .from("users")
    .select("id, email, full_name, role, firm_id, is_firm_admin")
    .eq("id", user.id)
    .single();

  if (!userData) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { data: firmMember } = await supabase
    .from("firm_members")
    .select("role, firm_id")
    .eq("user_id", user.id)
    .single();

  const { data: firm } = await supabase
    .from("firms")
    .select("id, name, slug")
    .eq("id", userData.firm_id)
    .single();

  return NextResponse.json({
    id: user.id,
    email: user.email,
    full_name: userData.full_name,
    role: userData.role,
    firm_id: userData.firm_id,
    firm_name: firm?.name,
    firm_role: firmMember?.role || userData.role,
    is_firm_admin: userData.is_firm_admin || firmMember?.role === "firm_admin",
    is_klaro_admin: user.email === process.env.ADMIN_EMAIL,
  });
}
