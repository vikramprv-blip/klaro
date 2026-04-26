const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID!
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN!
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886"

export async function sendWhatsApp(to: string, message: string): Promise<{ ok: boolean; sid?: string; error?: string }> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    return { ok: false, error: "Twilio credentials not configured" }
  }

  // Normalize phone number
  let toNumber = to.replace(/\s+/g, "").replace(/[^\d+]/g, "")
  if (!toNumber.startsWith("+")) {
    if (toNumber.startsWith("0")) toNumber = "+91" + toNumber.slice(1)
    else if (!toNumber.startsWith("91")) toNumber = "+91" + toNumber
    else toNumber = "+" + toNumber
  }
  const toWhatsApp = `whatsapp:${toNumber}`

  const body = new URLSearchParams({
    From: TWILIO_WHATSAPP_NUMBER,
    To: toWhatsApp,
    Body: message,
  })

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    }
  )

  const data = await response.json()
  if (data.sid) return { ok: true, sid: data.sid }
  return { ok: false, error: data.message || "Failed to send WhatsApp message" }
}

export function formatPayslipMessage(params: {
  employeeName: string
  month: string
  grossSalary: number
  pf: number
  esic: number
  pt: number
  tds: number
  totalDeductions: number
  netPay: number
  companyName: string
}): string {
  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`
  return `🏢 *${params.companyName}*
📋 *Payslip — ${params.month}*

👤 *${params.employeeName}*

━━━━━━━━━━━━━━━━
💰 *Earnings*
Gross Salary: ${fmt(params.grossSalary)}

📉 *Deductions*
PF (Employee): ${fmt(params.pf)}
ESIC: ${fmt(params.esic)}
Professional Tax: ${fmt(params.pt)}
Income Tax TDS: ${fmt(params.tds)}
Total Deductions: ${fmt(params.totalDeductions)}

━━━━━━━━━━━━━━━━
✅ *Net Take Home: ${fmt(params.netPay)}*

This is a system-generated payslip.
For queries, contact HR.`
}
