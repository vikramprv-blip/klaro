import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const MERCHANT = "00000000-0000-0000-0000-000000000001";

function invoiceNumber() {
  const n = new Date();
  return `INV-${n.getFullYear()}${String(n.getMonth()+1).padStart(2,"0")}-${String(Math.floor(Math.random()*9000)+1000)}`;
}

export async function GET() {
  const { data, error } = await supabase
    .from("ca_invoices")
    .select("*, ca_clients(id, name, email, phone, gstin)")
    .eq("merchant_id", MERCHANT)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) { console.error(error); return NextResponse.json([], { status: 200 }); }
  return NextResponse.json(data || []);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { client_id, amount, service_type, gst_rate, due_date, payment_method, notes } = body;
    if (!amount || isNaN(Number(amount))) return NextResponse.json({ ok: false, error: "Amount required" }, { status: 400 });
    const gst_amount = Math.round(Number(amount) * Number(gst_rate || 18) / 100);
    const total_amount = Number(amount) + gst_amount;
    const { data, error } = await supabase.from("ca_invoices")
      .insert([{ merchant_id: MERCHANT, invoice_number: invoiceNumber(), client_id: client_id || null, amount: Number(amount), gst_rate: Number(gst_rate || 18), gst_amount, total_amount, service_type: service_type || "Professional Services", due_date: due_date || null, payment_method: payment_method || null, notes: notes || null, status: "pending", currency: "INR" }])
      .select("*, ca_clients(id, name, email)").single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, invoice: data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
