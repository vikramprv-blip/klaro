import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const runtime = "nodejs";

async function getUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

function esc(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

function formatTallyDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

export async function GET(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from") || new Date(new Date().getFullYear(), 3, 1).toISOString();
  const to = searchParams.get("to") || new Date().toISOString();
  const type = searchParams.get("type") || "invoices";

  // Get company settings for firm name
  const settings = await prisma.companySettings.findFirst({
    where: { userId: user.id },
  });
  const firmName = settings?.companyName || "My CA Firm";
  const firmGstin = settings?.gstin || "";

  if (type === "invoices" || type === "all") {
    const invoices = await prisma.ca_invoices.findMany({
      where: {
        created_at: { gte: new Date(from), lte: new Date(to) },
      },
      include: { ca_clients: true },
      orderBy: { created_at: "asc" },
      take: 500,
    });

    const vouchers = invoices.map(inv => {
      const clientName = esc(inv.ca_clients?.name || "Unknown Client");
      const clientGstin = esc(inv.ca_clients?.gstin || "");
      const invNo = esc(inv.invoice_number);
      const amount = Number(inv.amount || 0);
      const gstAmount = Number(inv.gst_amount || 0);
      const totalAmount = Number(inv.total_amount || 0);
      const gstRate = Number(inv.gst_rate || 18);
      const serviceType = esc(inv.service_type || "Professional Services");
      const invDate = formatTallyDate(inv.created_at);
      const dueDate = formatTallyDate(inv.due_date);

      return `
    <VOUCHER REMOTEID="${invNo}" VCHTYPE="Sales" ACTION="Create">
      <DATE>${invDate}</DATE>
      <DUEDATE>${dueDate}</DUEDATE>
      <VOUCHERNUMBER>${invNo}</VOUCHERNUMBER>
      <PARTYLEDGERNAME>${clientName}</PARTYLEDGERNAME>
      <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
      <NARRATION>${serviceType}</NARRATION>
      <ISINVOICE>Yes</ISINVOICE>
      <ALLLEDGERENTRIES.LIST>
        <LEDGERNAME>${clientName}</LEDGERNAME>
        <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
        <AMOUNT>-${totalAmount.toFixed(2)}</AMOUNT>
        <BILLALLOCATIONS.LIST>
          <NAME>${invNo}</NAME>
          <BILLTYPE>New Ref</BILLTYPE>
          <AMOUNT>-${totalAmount.toFixed(2)}</AMOUNT>
        </BILLALLOCATIONS.LIST>
      </ALLLEDGERENTRIES.LIST>
      <ALLLEDGERENTRIES.LIST>
        <LEDGERNAME>${serviceType}</LEDGERNAME>
        <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
        <AMOUNT>${amount.toFixed(2)}</AMOUNT>
      </ALLLEDGERENTRIES.LIST>
      ${gstAmount > 0 ? `
      <ALLLEDGERENTRIES.LIST>
        <LEDGERNAME>Output GST @ ${gstRate}%</LEDGERNAME>
        <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
        <AMOUNT>${gstAmount.toFixed(2)}</AMOUNT>
      </ALLLEDGERENTRIES.LIST>` : ""}
    </VOUCHER>`;
    }).join("\n");

    // Also generate ledger masters for clients
    const uniqueClients = [...new Map(
      invoices.filter(i => i.ca_clients).map(i => [i.ca_clients!.id, i.ca_clients!])
    ).values()];

    const ledgers = uniqueClients.map(c => `
    <LEDGER NAME="${esc(c.name)}" ACTION="Create">
      <PARENT>Sundry Debtors</PARENT>
      <GSTREGISTRATIONTYPE>${c.gstin ? "Regular" : "Unregistered"}</GSTREGISTRATIONTYPE>
      <PARTYGSTIN>${esc(c.gstin || "")}</PARTYGSTIN>
      <OPENINGBALANCE>0</OPENINGBALANCE>
      <ISBILLWISEON>Yes</ISBILLWISEON>
      <AFFECTSSTOCK>No</AFFECTSSTOCK>
    </LEDGER>`).join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>All Masters</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>${esc(firmName)}</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          ${ledgers}
        </TALLYMESSAGE>
      </REQUESTDATA>
    </IMPORTDATA>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>${esc(firmName)}</SVCURRENTCOMPANY>
          <SVFROMDATE>${formatTallyDate(from)}</SVFROMDATE>
          <SVTODATE>${formatTallyDate(to)}</SVTODATE>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          ${vouchers}
        </TALLYMESSAGE>
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml",
        "Content-Disposition": `attachment; filename="klaro-tally-${formatDate(new Date())}.xml"`,
      },
    });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}
