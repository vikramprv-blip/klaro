import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import QRCode from "qrcode";

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: Request) {
  const { invoice_id } = await req.json();
  if (!invoice_id) return NextResponse.json({ error: "invoice_id required" }, { status: 400 });

  const { data: inv, error } = await sb
    .from("ca_invoices")
    .select("*, ca_clients(*), merchants(*)")
    .eq("id", invoice_id)
    .single();

  if (error || !inv) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

  // Generate IRN (Invoice Reference Number) — SHA-256 style unique ref
  const irnRaw = `${inv.merchants?.id || "SELLER"}-${inv.invoice_number}-${inv.ca_clients?.gstin || "CONSUMER"}-${inv.total_amount}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(irnRaw);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const irn = hashArray.map(b => b.toString(16).padStart(2, "0")).join("").toUpperCase().slice(0, 64);

  // Build QR payload per GST e-invoice spec
  const qrPayload = JSON.stringify({
    SellerGSTIN: inv.merchants?.gst_number || "",
    BuyerGSTIN: inv.ca_clients?.gstin || "URP",
    DocNo: inv.invoice_number,
    DocType: "INV",
    DocDt: inv.created_at?.split("T")[0] || new Date().toISOString().split("T")[0],
    TotInvVal: inv.total_amount,
    ItemCnt: 1,
    MainHsnCode: "998211",
    IRN: irn,
  });

  const qrDataUrl = await QRCode.toDataURL(qrPayload, { width: 200, margin: 1 });

  // Save IRN to invoice
  await sb.from("ca_invoices").update({ irn, qr_data: qrPayload }).eq("id", invoice_id);

  return NextResponse.json({ irn, qr: qrDataUrl, qrPayload: JSON.parse(qrPayload) });
}
