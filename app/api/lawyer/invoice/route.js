import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  const { matter_id, amount } = await req.json();

  const { data: matter } = await supabase
    .from("lawyer_matters")
    .select("*")
    .eq("id", matter_id)
    .single();

  const upiId = "yourupi@bank"; // replace later with firm config
  const note = `Legal fees for ${matter.title}`;

  const upiLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent("Klaro Legal")}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;

  return NextResponse.json({
    upiLink,
    client_name: matter.client_name,
    matter_title: matter.title
  });
}
