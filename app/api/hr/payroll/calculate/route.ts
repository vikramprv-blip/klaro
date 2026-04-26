import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Indian statutory deduction rules (FY 2026-27)
const PF_RATE = 0.12;          // 12% employee contribution
const PF_EMPLOYER_RATE = 0.12; // 12% employer contribution
const PF_WAGE_CEILING = 15000; // PF ceiling ₹15,000
const ESIC_EMPLOYEE_RATE = 0.0075; // 0.75% employee
const ESIC_EMPLOYER_RATE = 0.0325; // 3.25% employer
const ESIC_WAGE_CEILING = 21000;   // ESIC ceiling ₹21,000

// Professional Tax slabs (Maharashtra - most common)
function getProfessionalTax(monthlySalary: number): number {
  if (monthlySalary <= 7500) return 0;
  if (monthlySalary <= 10000) return 175;
  return 200; // Max PT in Maharashtra
}

// Income Tax TDS (simplified monthly)
function getIncomeTaxTDS(annualSalary: number): number {
  // New tax regime FY 2026-27
  if (annualSalary <= 300000) return 0;
  if (annualSalary <= 700000) return (annualSalary - 300000) * 0.05 / 12;
  if (annualSalary <= 1000000) return (20000 + (annualSalary - 700000) * 0.10) / 12;
  if (annualSalary <= 1200000) return (50000 + (annualSalary - 1000000) * 0.15) / 12;
  if (annualSalary <= 1500000) return (80000 + (annualSalary - 1200000) * 0.20) / 12;
  return (140000 + (annualSalary - 1500000) * 0.30) / 12;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      baseSalary = 0,
      bonus = 0,
      hra = 0,
      conveyance = 0,
      medicalAllowance = 0,
      otherAllowances = 0,
      state = "MH",
      pfOptOut = false,
      esicOptOut = false,
    } = body;

    const grossSalary = Number(baseSalary) + Number(hra) + Number(conveyance) +
      Number(medicalAllowance) + Number(otherAllowances);
    const totalGross = grossSalary + Number(bonus);

    // PF Calculation
    const pfWage = Math.min(Number(baseSalary), PF_WAGE_CEILING);
    const pfEmployee = pfOptOut ? 0 : Math.round(pfWage * PF_RATE);
    const pfEmployer = pfOptOut ? 0 : Math.round(pfWage * PF_EMPLOYER_RATE);

    // ESIC Calculation (only if salary <= ceiling)
    const esicApplicable = !esicOptOut && totalGross <= ESIC_WAGE_CEILING;
    const esicEmployee = esicApplicable ? Math.round(totalGross * ESIC_EMPLOYEE_RATE) : 0;
    const esicEmployer = esicApplicable ? Math.round(totalGross * ESIC_EMPLOYER_RATE) : 0;

    // Professional Tax
    const pt = getProfessionalTax(totalGross);

    // Income Tax TDS
    const annualGross = totalGross * 12;
    const itTds = Math.round(getIncomeTaxTDS(annualGross));

    // Total deductions
    const totalEmployeeDeductions = pfEmployee + esicEmployee + pt + itTds;
    const netPay = totalGross - totalEmployeeDeductions;

    // Total employer cost
    const employerCost = totalGross + pfEmployer + esicEmployer;

    return NextResponse.json({
      // Earnings
      baseSalary: Number(baseSalary),
      hra: Number(hra),
      conveyance: Number(conveyance),
      medicalAllowance: Number(medicalAllowance),
      otherAllowances: Number(otherAllowances),
      bonus: Number(bonus),
      grossSalary,
      totalGross,

      // Employee Deductions
      deductions: {
        pf: pfEmployee,
        esic: esicEmployee,
        professionalTax: pt,
        incomeTaxTds: itTds,
        total: totalEmployeeDeductions,
      },

      // Employer Contributions
      employerContributions: {
        pf: pfEmployer,
        esic: esicEmployer,
        total: pfEmployer + esicEmployer,
      },

      // Summary
      netPay: Math.round(netPay),
      employerCost: Math.round(employerCost),
      ctc: Math.round(employerCost * 12),

      // Flags
      esicApplicable,
      pfOptOut,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
