import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function certificateText(evidence) {
  return [
    "DRAFT CERTIFICATE UNDER SECTION 65B OF THE INDIAN EVIDENCE ACT",
    "",
    "This certificate records the production, storage, and integrity verification of the electronic record described below.",
    "",
    `Electronic Record: ${evidence.original_filename}`,
    `Evidence ID: ${evidence.id}`,
    `Matter ID: ${evidence.matter_id}`,
    `Hash Algorithm: SHA-256`,
    `File Hash: ${evidence.file_hash}`,
    `Uploaded At: ${evidence.uploaded_at}`,
    `Last Verified At: ${evidence.last_verified_at || "Not verified"}`,
    "",
    "The above electronic record was stored in the ordinary course of professional activity and its integrity has been verified by comparing its SHA-256 hash.",
    "",
    "This is a draft certificate and should be reviewed and signed by the responsible legal professional before filing.",
    "",
    "Name: ____________________",
    "Designation: ____________________",
    "Signature: ____________________",
    "Date: ____________________"
  ];
}

async function makePdf(lines) {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595, 842]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = 790;

  for (const line of lines) {
    const isTitle = line.includes("SECTION 65B");
    page.drawText(line || " ", {
      x: 50,
      y,
      size: isTitle ? 13 : 10,
      font: isTitle ? bold : font,
      color: rgb(0, 0, 0)
    });
    y -= isTitle ? 24 : 18;

    if (y < 60) {
      page = pdfDoc.addPage([595, 842]);
      y = 790;
    }
  }

  return Buffer.from(await pdfDoc.save());
}

export async function POST(req) {
  const { evidenceId } = await req.json();

  const { data: evidence, error } = await supabase
    .from("lawyer_evidence_vault")
    .select("*")
    .eq("id", evidenceId)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const lines = certificateText(evidence);
  const pdfBuffer = await makePdf(lines);

  const certificatePath = `certificates/${evidence.firm_id}/${evidence.matter_id}/${Date.now()}-${evidence.original_filename}.pdf`;

  const upload = await supabase.storage
    .from("lawyer-evidence")
    .upload(certificatePath, pdfBuffer, {
      contentType: "application/pdf",
      upsert: false
    });

  if (upload.error) return NextResponse.json({ error: upload.error.message }, { status: 500 });

  const { error: insertError } = await supabase
    .from("lawyer_evidence_certificates")
    .insert({
      firm_id: evidence.firm_id,
      evidence_id: evidence.id,
      certificate_text: lines.join("\n"),
      certificate_file_path: certificatePath,
      status: "draft"
    });

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

  return NextResponse.json({ certificate_file_path: certificatePath });
}
