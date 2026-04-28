import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const FIRM = "00000000-0000-0000-0000-000000000001";

// Encryption using AES-256-CBC
const VAULT_SECRET = process.env.VAULT_SECRET || "klaro-vault-secret-key-32-chars!";
const KEY = scryptSync(VAULT_SECRET, "klaro-salt", 32);

function encrypt(text: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv("aes-256-cbc", KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

function decrypt(text: string): string {
  const [ivHex, encHex] = text.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const enc = Buffer.from(encHex, "hex");
  const decipher = createDecipheriv("aes-256-cbc", KEY, iv);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
}

const PORTALS = [
  "GST Portal (gst.gov.in)",
  "Income Tax Portal (incometax.gov.in)",
  "TRACES (tdscpc.gov.in)",
  "MCA Portal (mca.gov.in)",
  "EPFO Portal",
  "ESIC Portal",
  "Profession Tax Portal",
  "State VAT Portal",
  "ROC Portal",
  "Other"
];

export async function GET() {
  const { data, error } = await supabase
    .from("client_credentials")
    .select("id, client_name, portal, username, notes, last_used, created_at, client_id")
    .eq("firm_id", FIRM)
    .order("client_name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ credentials: data || [], portals: PORTALS });
}

export async function POST(req: Request) {
  const { client_name, client_id, portal, username, password, notes } = await req.json();
  if (!username || !password) return NextResponse.json({ error: "Username and password required" }, { status: 400 });

  const password_enc = encrypt(password);
  const { data, error } = await supabase
    .from("client_credentials")
    .insert([{ firm_id: FIRM, client_name, client_id, portal, username, password_enc, notes }])
    .select("id, client_name, portal, username, notes, created_at").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: Request) {
  const { id, reveal } = await req.json();
  if (reveal) {
    const { data, error } = await supabase
      .from("client_credentials").select("password_enc").eq("id", id).single();
    if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await supabase.from("client_credentials").update({ last_used: new Date().toISOString() }).eq("id", id);
    return NextResponse.json({ password: decrypt(data.password_enc) });
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  const { error } = await supabase.from("client_credentials").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
