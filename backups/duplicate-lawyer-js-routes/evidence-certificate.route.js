import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function certificateLines(evidence, firm, matter) {
  const now = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  return [
    "CERTIFICATE UNDER SECTION 65B OF THE INDIAN EVIDENCE ACT, 1872",
    "",
    `Issuing Firm: ${firm?.name || "Law Firm"}`,
    `Bar Council Reg: ${firm?.bar_council || "N/A"}`,
    `Address: ${[firm?.address, firm?.city, firm?.state].filter(Boolean).join(", ") || "N/A"}`,
    "",
    "DETAILS OF ELECTRONIC RECORD",
    "",
    `File Name       : ${evidence.file_name}`,
    `Matter          : ${matter?.matter_title || matter?.title || "N/A"}`,
    `Client          : ${matter?.client_name || "N/A"}`,
    `CNR Number      : ${matter?.cnr_number || "N/A"}`,
    `Evidence ID     : ${evidence.id}`,
    `Hash Algorithm  : SHA-256`,
    `SHA-256 Hash    : ${evidence.sha256_hash}`,
    `File Size       : ${evidence.file_size ? (evidence.file_size / 1024).toFixed(2) + " KB" : "N/A"}`,
    `MIME Type       : ${evidence.mime_type || "N/A"}`,
    `Uploaded At     : ${new Date(evidence.created_at).toLocaleString("en-IN")}`,
    `Certificate Gen : ${now} IST`,
    `Verified        : ${evidence.verified ? "Yes" : "No"}`,
    "",
    "CERTIFICATION",
    "",
    "I hereby certify that:",
    "",
    "1. The electronic record described above was produced from a computer system",
    "   used regularly in the course of professional legal activities.",
    "",
    "2. The computer system was operating properly at the time of storage.",
    "",
    "3. The SHA-256 hash value above uniquely identifies this electronic record",
    "   and can be used to verify its integrity at any future time.",
    "",
    "4. The information contained in this certificate is to the best of my",
    "   knowledge and belief, true and correct.",
    "",
    "This certificate is issued under Section 65B(4) of the Indian Evidence Act, 1872.",
    "",
    "",
    "Name         : ____________________________",
    "",
    "Designation  : ____________________________",
    "",
    "Signature    : ____________________________",
    "",
    `Date         : ${new Date().toLocaleDateString("en-IN")}`,
    "",
    "Place        : ____________________________",
    "",
    "",
    "[ Official Seal / Stamp ]",
  ];
}

async function makePdf(lines, firm) {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595, 842]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const mono = await pdfDoc.embedFont(StandardFonts.Courier);

  // Header bar
  page.drawRectangle({ x: 0, y: 800, width: 595, height: 42, color: rgb(0.05, 0.05, 0.15) });
  page.drawText("SECTION 65B CERTIFICATE — INDIAN EVIDENCE ACT 1872", {
    x: 30, y: 815, size: 11, font: bold, color: rgb(1, 1, 1)
  });

  let y = 780;
  for (const line of lines) {
    const isSection = line === "DETAILS OF ELECTRONIC RECORD" || line === "CERTIFICATION" || line.startsWith("CERTIFICATE UNDER");
    const isHash = line.startsWith("SHA-256 Hash");
    const size = isSection ? 11 : line.startsWith("Issuing Firm") ? 10 : 9;
    const f = isSection ? bold : isHash ? mono : font;
    const color = isSection ? rgb(0.1, 0.1, 0.5) : rgb(0, 0, 0);

    if (isSection) {
      page.drawLine({ start: { x: 30, y: y - 2 }, end: { x: 565, y: y - 2 }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7) });
      y -= 4;
    }

    page.drawText(line || " ", { x: 30, y, size, font: f, color });
    y -= line === "" ? 8 : size + 6;

    if (y < 60) {
      page = pdfDoc.addPage([595, 842]);
      y = 780;
    }
  }

  // Footer
  page.drawLine({ start: { x: 30, y: 40 }, end: { x: 565, y: 40 }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) });
  page.drawText("This is a computer-generated certificate. Verify authenticity using the SHA-256 hash.", {
    x: 30, y: 25, size: 7, font, color: rgb(0.5, 0.5, 0.5)
  });

  return Buffer.from(await pdfDoc.save());
}

export async function POST(req) {
  const { evidenceId } = await req.json();

  const { data: evidence, error } = await supabase
    .from("evidence_files")
    .select("*")
    .eq("id", evidenceId)
    .single();

  if (error || !evidence) return NextResponse.json({ error: error?.message || "Not found" }, { status: 404 });

  const { data: firm } = await supabase.from("firms").select("*").eq("id", evidence.firm_id).single();
  const { data: matter } = await supabase.from("legal_matters").select("*").eq("id", evidence.matter_id).single();

  const lines = certificateLines(evidence, firm, matter);
  const pdfBuffer = await makePdf(lines, firm);

  const certPath = `certificates/${evidence.firm_id}/${evidence.matter_id}/${Date.now()}-cert.pdf`;

  const { error: uploadError } = await supabase.storage
    .from("lawyer-evidence")
    .upload(certPath, pdfBuffer, { contentType: "application/pdf", upsert: true });

  if (uploadError) {
    // If bucket doesn't exist, return PDF directly
    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="65B-certificate-${evidenceId}.pdf"`,
      },
    });
  }

  // Update evidence_files with certificate_url
  await supabase.from("evidence_files").update({ certificate_url: certPath }).eq("id", evidenceId);

  const { data: { publicUrl } } = supabase.storage.from("lawyer-evidence").getPublicUrl(certPath);

  return NextResponse.json({ certificate_url: publicUrl, certificate_path: certPath });
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const evidenceId = searchParams.get("id");
  if (!evidenceId) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { data: evidence } = await supabase.from("evidence_files").select("*").eq("id", evidenceId).single();
  if (!evidence) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: firm } = await supabase.from("firms").select("*").eq("id", evidence.firm_id).single();
  const { data: matter } = await supabase.from("legal_matters").select("*").eq("id", evidence.matter_id).single();

  const lines = certificateLines(evidence, firm, matter);
  const pdfBuffer = await makePdf(lines, firm);

  return new Response(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="65B-${evidence.file_name}.pdf"`,
    },
  });
}
