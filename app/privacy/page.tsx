"use client"
import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div style={{ minHeight:"100vh", background:"#0A0F1E", color:"#F1F5F9", fontFamily:"system-ui,sans-serif" }}>
      <nav style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"20px 48px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        <Link href="/" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none" }}>
          <div style={{ width:28, height:28, borderRadius:7, background:"linear-gradient(135deg,#6366F1,#8B5CF6)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:13, color:"#fff" }}>K</div>
          <span style={{ fontSize:15, fontWeight:800, color:"#F1F5F9" }}>klaro</span>
        </Link>
        <Link href="/" style={{ fontSize:13, color:"#94A3B8", textDecoration:"none" }}>← Back to Klaro</Link>
      </nav>
      <div style={{ maxWidth:760, margin:"0 auto", padding:"60px 48px" }}>
        <p style={{ fontFamily:"monospace", fontSize:11, color:"#6366F1", letterSpacing:"0.1em", marginBottom:8 }}>LEGAL</p>
        <h1 style={{ fontSize:36, fontWeight:900, letterSpacing:"-0.02em", marginBottom:8 }}>Privacy Policy</h1>
        <p style={{ fontSize:13, color:"#94A3B8", marginBottom:48 }}>Last updated: April 10, 2026 · Version 1.0</p>

        {[
          ["1. Who We Are", "Klaro Tech Inc is a US-registered technology company providing financial software tools (Sparo, Varo) to freelancers, agencies and small businesses. Our registered address is in the United States. You can contact us at privacy@klaro.services."],
          ["2. What Data We Collect", "We collect: (a) Account data — name, email, business name, country, when you sign up. (b) Payment data — invoice amounts, transaction references, fee amounts. We never store card numbers. (c) Client data — names, WhatsApp numbers, emails of your clients that you enter into Varo. (d) Usage data — pages visited, features used, browser type. (e) Communication data — WhatsApp message logs sent via Varo."],
          ["3. How We Use Your Data", "We use your data to: provide and improve our services, send transactional emails (OTP codes, receipts), send WhatsApp messages on your behalf via Varo, generate invoices and payment links, sync data with accounting software you connect, comply with legal obligations."],
          ["4. Your Client's Data", "When you use Varo to send invoices, you are the data controller for your clients' personal data. We process it on your behalf as a data processor. You are responsible for having a lawful basis to share your clients' data with us. We never use your clients' data for our own marketing."],
          ["5. Data Sharing", "We share data with: Supabase (database hosting, US), Vercel (hosting, US), WhatsApp Business API providers (message delivery), accounting platforms you choose to connect (Tally, Zoho, QuickBooks etc). We do not sell your data. Ever."],
          ["6. Data Retention", "We retain your account data for as long as your account is active. After account deletion, we delete personal data within 30 days. Invoice and transaction records may be retained for 7 years for legal and tax compliance."],
          ["7. Your Rights (GDPR)", "If you are in the EU/EEA or UK, you have the right to: access your data, correct inaccurate data, delete your data, restrict processing, data portability, and object to processing. Email privacy@klaro.services to exercise these rights. We will respond within 30 days."],
          ["8. Indian Users (DPDP Act)", "We comply with India's Digital Personal Data Protection Act 2023. Indian users have the right to access, correct and erase personal data. We process your data with your consent given at signup. Contact privacy@klaro.services for any DPDP requests."],
          ["9. Cookies", "We use essential cookies for authentication and session management. We use analytics cookies to understand usage. You can control cookies via our Cookie Settings. We do not use advertising cookies."],
          ["10. Security", "We use industry-standard encryption (TLS 1.3), encrypt sensitive credentials at rest, use Supabase Row Level Security to isolate your data, and conduct regular security reviews. However, no system is 100% secure. Please use a strong email password."],
          ["11. Changes to This Policy", "We will notify you by email if we make material changes to this policy. Continued use after notification constitutes acceptance."],
          ["12. Contact", "For privacy questions: privacy@klaro.services. For general questions: hello@klaro.services. Response time: within 5 business days."],
        ].map(([title, body]) => (
          <div key={String(title)} style={{ marginBottom:36 }}>
            <h2 style={{ fontSize:18, fontWeight:700, marginBottom:10, color:"#F1F5F9" }}>{title}</h2>
            <p style={{ fontSize:15, color:"#94A3B8", lineHeight:1.8 }}>{body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
