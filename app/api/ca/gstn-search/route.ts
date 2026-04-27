import { NextResponse } from "next/server";

// GSTIN validation regex
function validateGSTIN(gstin: string): { valid: boolean; state: string; pan: string; entity_type: string } {
  const STATE_CODES: Record<string, string> = {
    "01": "Jammu & Kashmir", "02": "Himachal Pradesh", "03": "Punjab",
    "04": "Chandigarh", "05": "Uttarakhand", "06": "Haryana",
    "07": "Delhi", "08": "Rajasthan", "09": "Uttar Pradesh",
    "10": "Bihar", "11": "Sikkim", "12": "Arunachal Pradesh",
    "13": "Nagaland", "14": "Manipur", "15": "Mizoram",
    "16": "Tripura", "17": "Meghalaya", "18": "Assam",
    "19": "West Bengal", "20": "Jharkhand", "21": "Odisha",
    "22": "Chhattisgarh", "23": "Madhya Pradesh", "24": "Gujarat",
    "25": "Daman & Diu", "26": "Dadra & Nagar Haveli", "27": "Maharashtra",
    "28": "Andhra Pradesh", "29": "Karnataka", "30": "Goa",
    "31": "Lakshadweep", "32": "Kerala", "33": "Tamil Nadu",
    "34": "Puducherry", "35": "Andaman & Nicobar", "36": "Telangana",
    "37": "Andhra Pradesh (New)", "38": "Ladakh", "97": "Other Territory",
    "99": "Centre Jurisdiction"
  };

  const ENTITY_TYPES: Record<string, string> = {
    "1": "Individual / Proprietor",
    "2": "Partnership",
    "3": "HUF",
    "4": "Company",
    "5": "Trust",
    "6": "AOP / BOI",
    "7": "Govt Entity",
    "8": "Govt Entity",
    "9": "Local Authority",
    "A": "AOP / BOI",
    "B": "Body of Individuals",
    "C": "Company",
    "F": "Firm / LLP",
    "G": "Govt",
    "H": "HUF",
    "L": "Local Authority",
    "J": "Artificial Juridical Person",
    "P": "Individual / Proprietor",
    "T": "Trust / AOP",
  };

  const g = gstin.trim().toUpperCase();
  const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

  if (!regex.test(g)) return { valid: false, state: "", pan: "", entity_type: "" };

  const stateCode = g.substring(0, 2);
  const pan = g.substring(2, 12);
  const entityChar = pan[4]; // 5th char of PAN = entity type

  return {
    valid: true,
    state: STATE_CODES[stateCode] || "Unknown State",
    pan,
    entity_type: ENTITY_TYPES[entityChar] || "Unknown"
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const gstin = searchParams.get("gstin")?.trim().toUpperCase() || "";

  if (!gstin) return NextResponse.json({ error: "GSTIN required" }, { status: 400 });
  if (gstin.length !== 15) return NextResponse.json({ error: "GSTIN must be 15 characters", valid: false }, { status: 400 });

  const validation = validateGSTIN(gstin);

  if (!validation.valid) {
    return NextResponse.json({ valid: false, error: "Invalid GSTIN format", gstin });
  }

  // Try public GSTN lookup
  let gstn_data: any = null;
  try {
    const res = await fetch(`https://sheet.best/api/sheets/gstin/${gstin}`, {
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) gstn_data = await res.json();
  } catch {}

  return NextResponse.json({
    valid: true,
    gstin,
    state: validation.state,
    pan: validation.pan,
    entity_type: validation.entity_type,
    gstn_data,
    registration_date: null,
    business_name: gstn_data?.trade_name || null,
    status: gstn_data?.status || "Active (inferred)",
    note: "Full details available after GSTN API integration (GSTZen)"
  });
}
