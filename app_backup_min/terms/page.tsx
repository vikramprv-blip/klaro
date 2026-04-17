"use client"
import Link from "next/link"

export default function TermsPage() {
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
        <h1 style={{ fontSize:36, fontWeight:900, letterSpacing:"-0.02em", marginBottom:8 }}>Terms of Service</h1>
        <p style={{ fontSize:13, color:"#94A3B8", marginBottom:48 }}>Last updated: April 10, 2026 · Version 1.0</p>

        {[
          ["1. Acceptance", "By creating an account or using Klaro Tech services (including Sparo and Varo), you agree to these Terms. If you do not agree, do not use our services. These Terms form a legally binding agreement between you and Klaro Tech Inc."],
          ["2. Our Services", "Klaro Tech provides: Sparo (payment link generation with fee passthrough), Varo (AI-powered invoice collections and WhatsApp reminders), and related tools. Services are provided as-is and may change over time."],
          ["3. Your Account", "You must provide accurate information when signing up. You are responsible for all activity under your account. You must be at least 18 years old. One person or business may not maintain multiple free accounts."],
          ["4. Acceptable Use", "You may not use our services to: send spam or unsolicited messages, violate any law or regulation, infringe intellectual property rights, send messages to people who have not consented to receive them, impersonate others, or attempt to reverse engineer our software."],
          ["5. Payment and Billing", "Free plans are free forever with stated limits. Paid plans are billed monthly or annually. Payments are non-refundable except as required by law. We reserve the right to change pricing with 30 days notice."],
          ["6. WhatsApp and Messaging", "When using Varo, you confirm that: you have consent from your clients to contact them via WhatsApp, you will not use Varo to send unsolicited commercial messages, you comply with WhatsApp Business Policy. We may suspend accounts that violate messaging policies."],
          ["7. Accounting Integrations", "Connections to third-party accounting software (Tally, Zoho, QuickBooks etc) are provided as convenience features. We are not responsible for errors in data sync, data loss in third-party systems, or changes to third-party APIs."],
          ["8. Limitation of Liability", "Klaro Tech is not liable for: lost revenue or profits, data loss, indirect or consequential damages. Our total liability is limited to fees paid in the 3 months preceding the claim. Some jurisdictions do not allow these limitations."],
          ["9. Intellectual Property", "Klaro Tech owns all rights to our software, brand, and content. You retain ownership of your data. You grant us a license to process your data to provide the services."],
          ["10. Termination", "You may cancel your account at any time from Settings. We may suspend or terminate accounts that violate these Terms. On termination, your data will be deleted within 30 days."],
          ["11. Governing Law", "These Terms are governed by the laws of Delaware, United States. Disputes shall be resolved by binding arbitration in Delaware, except you may bring claims in small claims court."],
          ["12. Changes", "We may update these Terms. Material changes will be notified by email 14 days in advance. Continued use after the effective date constitutes acceptance."],
          ["13. Contact", "Legal notices: legal@klaro.services. General: hello@klaro.services."],
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
