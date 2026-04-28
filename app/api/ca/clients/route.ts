import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const FIRM_ID = "00000000-0000-0000-0000-000000000001";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await supabase
    .from("ca_clients")
    .select("id, name, email, phone, gstin, pan, entity_type, city, state, status, tier, services, financial_year, created_at")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(req: Request) {
  const body = await req.json();
  const name = String(body.name || "").trim();
  if (!name) return NextResponse.json({ ok: false, error: "Client name is required" }, { status: 400 });

  const { data, error } = await supabase
    .from("ca_clients")
    .insert([{
      merchant_id: FIRM_ID,
      name,
      email: body.email || null,
      phone: body.phone || null,
      gstin: body.gstin || null,
      pan: body.pan || null,
      entity_type: body.entity_type || "Proprietorship",
      address: body.address || null,
      city: body.city || null,
      state: body.state || null,
      pincode: body.pincode || null,
      tier: body.tier || "Standard",
      services: body.services || [],
      financial_year: body.financial_year || "2025-26",
      notes: body.notes || null,
      is_active: true,
      status: "active",
      client_type: body.entity_type === "Individual" ? "individual" : "business",
    }])
    .select().single();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, client: data });
}
