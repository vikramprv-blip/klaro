import { NextResponse } from "next/server";
export async function POST(req: Request) {
  const { baseSalary = 0, hra = 0, conveyance = 0, bonus = 0 } = await req.json();
  const gross = Number(baseSalary) + Number(hra) + Number(conveyance) + Number(bonus);
  const esicApplicable = gross <= 21000;
  const pf = Math.round(Math.min(Number(baseSalary), 15000) * 0.12);
  const esic = esicApplicable ? Math.round(gross * 0.0075) : 0;
  const professionalTax = gross > 15000 ? 200 : gross > 10000 ? 150 : 0;
  const annualGross = gross * 12;
  let incomeTaxTds = 0;
  if (annualGross > 1500000) incomeTaxTds = Math.round((annualGross - 1500000) * 0.30 / 12);
  else if (annualGross > 1200000) incomeTaxTds = Math.round((annualGross - 1200000) * 0.20 / 12);
  else if (annualGross > 900000) incomeTaxTds = Math.round((annualGross - 900000) * 0.15 / 12);
  else if (annualGross > 600000) incomeTaxTds = Math.round((annualGross - 600000) * 0.10 / 12);
  else if (annualGross > 300000) incomeTaxTds = Math.round((annualGross - 300000) * 0.05 / 12);
  const totalDeductions = pf + esic + professionalTax + incomeTaxTds;
  const netPay = gross - totalDeductions;
  const employerPf = pf;
  const employerEsic = esicApplicable ? Math.round(gross * 0.0325) : 0;
  const employerCost = gross + employerPf + employerEsic;
  return NextResponse.json({
    baseSalary: Number(baseSalary), hra: Number(hra), conveyance: Number(conveyance), bonus: Number(bonus),
    grossSalary: gross, totalGross: gross,
    deductions: { pf, esic, professionalTax, incomeTaxTds, total: totalDeductions },
    employerContributions: { pf: employerPf, esic: employerEsic, total: employerPf + employerEsic },
    netPay, employerCost, ctc: employerCost * 12, esicApplicable
  });
}
