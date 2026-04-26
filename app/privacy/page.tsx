export const metadata = {
  title: "Privacy Policy — Klaro",
  description: "How Klaro collects, uses, and protects your personal data under the DPDP Act 2023.",
}

const EFFECTIVE_DATE = "27 April 2026"
const REVIEW_DATE = "27 October 2026"

export default function PrivacyPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="inline-block bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full mb-4">
          DPDP Act 2023 & Rules 2025 Compliant
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Privacy Policy</h1>
        <p className="text-sm text-gray-500">
          Effective Date: {EFFECTIVE_DATE} &nbsp;·&nbsp; Next Review: {REVIEW_DATE} &nbsp;·&nbsp; Version 1.0
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Issued by: Klaro (klaro.services) &nbsp;·&nbsp; Grievance Officer: Vikram Chawla
        </p>
      </div>

      {/* Notice box */}
      <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-xl p-4 mb-8">
        <p className="text-sm font-semibold text-amber-800 mb-1">Plain Language Notice (Required under DPDP Rules 2025)</p>
        <p className="text-sm text-amber-700">
          This policy explains what personal data Klaro collects, why we collect it, how long we keep it,
          and your rights over it. We collect only what is necessary to provide our services.
          You can withdraw your consent, access your data, or delete your account at any time.
          This policy is written in plain English so you can understand it without legal expertise.
        </p>
      </div>

      <div className="prose prose-gray max-w-none space-y-8">

        {/* 1. Who We Are */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
            1. Who We Are (Data Fiduciary)
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Klaro (operated at klaro.services) is a Software-as-a-Service platform for Indian Chartered
            Accountants and law firms. Under the Digital Personal Data Protection Act, 2023 (DPDP Act)
            and DPDP Rules, 2025, Klaro is the <strong>Data Fiduciary</strong> — we determine the purpose
            and means of processing your personal data.
          </p>
          <p className="text-gray-700 leading-relaxed mt-3">
            When you use Klaro to manage your own clients or employees, you become a Data Fiduciary
            for that data. Klaro acts as your <strong>Data Processor</strong> in that context, processing
            data only on your instructions.
          </p>
        </section>

        {/* 2. What Data We Collect */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
            2. What Personal Data We Collect and Why
          </h2>
          <p className="text-gray-700 mb-4">
            We collect only the data necessary for each specific purpose. Below is a complete list:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-900 text-white">
                  <th className="text-left px-4 py-3 font-medium rounded-tl-lg">Data Type</th>
                  <th className="text-left px-4 py-3 font-medium">Why We Collect It</th>
                  <th className="text-left px-4 py-3 font-medium">Legal Basis</th>
                  <th className="text-left px-4 py-3 font-medium rounded-tr-lg">Retention Period</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Name, email address", "Create and manage your account, send service notifications", "Consent", "Duration of account + 30 days after deletion"],
                  ["Phone number", "WhatsApp notifications, payslip delivery, account recovery", "Consent", "Duration of account + 30 days"],
                  ["GSTIN, PAN", "GST invoice generation, compliance tracking", "Legal obligation (GST Act, Income Tax Act)", "7 years (statutory requirement)"],
                  ["Bank account details, UPI ID", "Display on invoices for client payments", "Consent", "Duration of account + 7 years (tax records)"],
                  ["Company name, address", "Invoice header, compliance documents", "Consent", "Duration of account + 7 years"],
                  ["Employee names, salaries, roles", "HR management, payroll calculation, attendance tracking", "Consent (yours and your employees')", "5 years from last payroll entry"],
                  ["GPS location (attendance punch-in)", "Verify employee is within office geo-fence at time of punch-in", "Consent (employee consent required)", "12 months then auto-deleted"],
                  ["Client names, contact details", "Client relationship management, compliance tracking", "Consent", "Duration of account + 30 days"],
                  ["Uploaded documents (PDF, DOCX, images)", "Document vault, AI-powered search across your documents", "Consent", "Duration of account + 30 days after deletion"],
                  ["AI embeddings of document content", "Enable semantic search across your documents using Voyage AI", "Consent", "Duration of account + 30 days"],
                  ["GST, TDS, ITR filing records", "Compliance tracking, deadline management", "Consent + legal obligation", "7 years (statutory requirement)"],
                  ["IP address, device information", "Security monitoring, fraud prevention, debugging", "Legitimate interest (security)", "90 days then auto-deleted"],
                  ["Session tokens, cookies", "Keep you logged in, remember preferences", "Consent (via cookie banner)", "Session cookies: deleted on logout. Analytics: 1 year"],
                  ["Usage data (pages visited, features used)", "Improve the product, identify bugs", "Consent (via cookie banner for analytics)", "12 months then anonymised"],
                  ["Payment reference numbers (UPI)", "Verify subscription payments, generate receipts", "Consent + legal obligation", "7 years (tax records)"],
                ].map(([dataType, why, basis, retention], i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    <td className="px-4 py-3 font-medium text-gray-800 align-top">{dataType}</td>
                    <td className="px-4 py-3 text-gray-600 align-top">{why}</td>
                    <td className="px-4 py-3 align-top">
                      <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                        basis === "Consent" ? "bg-blue-50 text-blue-700" :
                        basis.includes("Legal") ? "bg-green-50 text-green-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>{basis}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs align-top">{retention}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. How We Use Your Data */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
            3. How We Use Your Data
          </h2>
          <p className="text-gray-700 mb-3">We use your personal data strictly for the purposes stated at the time of collection:</p>
          <ul className="space-y-2 text-gray-700">
            {[
              "Providing the CA practice management platform — client tracking, GST/TDS/ITR filing management, invoicing",
              "HR and payroll features — employee records, attendance, leave, payroll calculations with PF/ESIC/PT",
              "AI document search — processing uploaded documents to create searchable embeddings via Voyage AI",
              "Sending WhatsApp messages — payslips, compliance reminders, invoice notifications (only with your consent)",
              "Billing and subscription management — verifying UPI payments, activating and renewing your plan",
              "Security and fraud prevention — detecting unusual access patterns, protecting your account",
              "Product improvement — understanding which features are used, identifying and fixing bugs",
              "Legal compliance — maintaining records as required by Indian tax and company law",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-blue-500 mt-1 shrink-0">▸</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-gray-800 mb-1">What We Do NOT Do</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✗ We do not sell your personal data to any third party</li>
              <li>✗ We do not use your data for advertising or marketing to others</li>
              <li>✗ We do not share your data with competitors</li>
              <li>✗ We do not use your client data to contact your clients directly</li>
              <li>✗ We do not train general AI models on your documents or client data</li>
            </ul>
          </div>
        </section>

        {/* 4. Third-Party Processors */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
            4. Third-Party Data Processors
          </h2>
          <p className="text-gray-700 mb-4">
            We share your data with the following third-party processors who provide infrastructure
            and services. Each processor has signed a Data Processing Agreement with us and is
            contractually required to protect your data.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-900 text-white">
                  <th className="text-left px-4 py-3 font-medium">Processor</th>
                  <th className="text-left px-4 py-3 font-medium">Purpose</th>
                  <th className="text-left px-4 py-3 font-medium">Data Location</th>
                  <th className="text-left px-4 py-3 font-medium">Their Privacy Policy</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Supabase (via AWS)", "Database, authentication, file storage", "USA (AWS us-east-1)", "supabase.com/privacy"],
                  ["Vercel", "Application hosting, CDN, serverless functions", "USA + Global CDN", "vercel.com/legal/privacy-policy"],
                  ["Cloudflare", "DDoS protection, WAF, DNS, CDN", "Global (data processed, not stored)", "cloudflare.com/privacypolicy"],
                  ["Twilio", "WhatsApp message delivery (payslips, reminders)", "USA", "twilio.com/en-us/legal/privacy"],
                  ["Voyage AI", "AI document embeddings for semantic search", "USA", "voyageai.com/privacy"],
                  ["Resend / SendGrid", "Transactional emails (OTP, notifications)", "USA", "resend.com/privacy"],
                  ["PostHog", "Product analytics (only with cookie consent)", "EU", "posthog.com/privacy"],
                ].map(([processor, purpose, location, policy], i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    <td className="px-4 py-3 font-medium text-gray-800">{processor}</td>
                    <td className="px-4 py-3 text-gray-600">{purpose}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        location.includes("USA") ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"
                      }`}>{location}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-blue-600">{policy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-xl p-4">
            <p className="text-sm font-semibold text-amber-800 mb-1">Cross-Border Data Transfer Notice</p>
            <p className="text-sm text-amber-700">
              Several processors store data in the United States. India's approved country list under
              Rule 15 of the DPDP Rules 2025 has not yet been notified by MeitY. We rely on Standard
              Contractual Clauses (SCCs) and Data Processing Agreements as transfer safeguards.
              We will update this notice when the approved country list is published.
            </p>
          </div>
        </section>

        {/* 5. Your Rights */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
            5. Your Rights Under the DPDP Act
          </h2>
          <p className="text-gray-700 mb-4">
            Under the Digital Personal Data Protection Act 2023, you have the following rights.
            We will respond to all requests within <strong>30 days</strong>.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                right: "Right to Access",
                desc: "Request a complete copy of all personal data we hold about you.",
                how: "Go to Settings > Data & Privacy > Export All Data"
              },
              {
                right: "Right to Correction",
                desc: "Request correction of inaccurate or incomplete personal data.",
                how: "Update directly in Settings > Company Settings, or email the Grievance Officer"
              },
              {
                right: "Right to Erasure",
                desc: "Request deletion of all your personal data from our systems.",
                how: "Go to Settings > Data & Privacy > Delete Account. All data deleted within 30 days."
              },
              {
                right: "Right to Withdraw Consent",
                desc: "Withdraw your consent for data processing at any time.",
                how: "Delete your account (for full withdrawal) or contact the Grievance Officer for specific consent types"
              },
              {
                right: "Right to Nominate",
                desc: "Nominate another person to exercise your rights on your behalf.",
                how: "Email the Grievance Officer with the nominee's name and contact details"
              },
              {
                right: "Right to Grievance Redressal",
                desc: "File a complaint about how your data is being handled.",
                how: "Email the Grievance Officer. If unresolved in 30 days, approach the Data Protection Board of India at dpboard.gov.in"
              },
            ].map(({ right, desc, how }, i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-4 bg-white">
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{right}</h3>
                <p className="text-gray-600 text-sm mb-2">{desc}</p>
                <p className="text-xs text-blue-700 bg-blue-50 rounded-lg px-3 py-1.5">
                  <span className="font-medium">How: </span>{how}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 6. Consent & Withdrawal */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
            6. Consent and How to Withdraw It
          </h2>
          <p className="text-gray-700 mb-3">
            We obtain your consent separately for each purpose at signup. Consent is never bundled
            with the Terms of Service. You can withdraw consent at any time — withdrawal is as easy
            as giving it.
          </p>
          <div className="space-y-3">
            {[
              { type: "Account & service data", withdraw: "Delete your account from Settings > Data & Privacy > Delete Account" },
              { type: "WhatsApp notifications", withdraw: "Reply STOP to any WhatsApp message, or contact the Grievance Officer" },
              { type: "Analytics cookies", withdraw: "Use the cookie settings banner (re-open via the cookie icon in the footer)" },
              { type: "GPS attendance data", withdraw: "Your employer can disable geo-attendance in their Settings > Offices" },
              { type: "AI document processing", withdraw: "Delete individual documents from the Documents section, or delete your account" },
            ].map(({ type, withdraw }, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <span className="text-gray-400 font-medium w-52 shrink-0">{type}</span>
                <span className="text-gray-600">{withdraw}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 7. Data Security */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
            7. How We Protect Your Data
          </h2>
          <p className="text-gray-700 mb-4">
            We implement reasonable security safeguards as required by Section 8 of the DPDP Act:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              ["Encryption in transit", "TLS 1.3 on all connections via Cloudflare"],
              ["Encryption at rest", "AES-256 database encryption via Supabase"],
              ["Access controls", "Row-level security — you see only your data"],
              ["Web Application Firewall", "Cloudflare WAF blocks malicious requests"],
              ["Authentication", "Secure sessions with email verification"],
              ["Security audits", "Annual penetration testing by CERT-In empanelled auditors"],
              ["Breach monitoring", "Real-time error and anomaly detection via Sentry"],
              ["Backups", "Automated daily database backups with point-in-time recovery"],
              ["Data minimisation", "We collect only what is necessary for each feature"],
            ].map(([control, detail], i) => (
              <div key={i} className="bg-green-50 border border-green-100 rounded-xl p-3">
                <p className="text-sm font-semibold text-green-800 mb-0.5">{control}</p>
                <p className="text-xs text-green-700">{detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 8. Data Breach */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
            8. Data Breach Notification
          </h2>
          <p className="text-gray-700">
            In the event of a personal data breach that is likely to cause harm to you, we will:
          </p>
          <ul className="mt-3 space-y-2 text-gray-700">
            <li className="flex items-start gap-2"><span className="text-red-500 shrink-0 mt-0.5">▸</span>Notify the Data Protection Board of India (DPBI) within 72 hours of becoming aware of the breach</li>
            <li className="flex items-start gap-2"><span className="text-red-500 shrink-0 mt-0.5">▸</span>Notify all affected users within 72 hours via email, describing the breach, what data was involved, steps taken, and what you should do</li>
            <li className="flex items-start gap-2"><span className="text-red-500 shrink-0 mt-0.5">▸</span>Take immediate steps to contain and remediate the breach</li>
            <li className="flex items-start gap-2"><span className="text-red-500 shrink-0 mt-0.5">▸</span>Provide a follow-up report within 14 days with the root cause and permanent fix</li>
          </ul>
          <p className="text-gray-700 mt-3">
            To report a suspected security vulnerability, email{" "}
            <a href="mailto:vikramprv@gmail.com" className="text-blue-600 underline">vikramprv@gmail.com</a>{" "}
            with the subject line <strong>SECURITY REPORT</strong>.
          </p>
        </section>

        {/* 9. Children */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
            9. Children&apos;s Data
          </h2>
          <p className="text-gray-700">
            Klaro is a B2B platform for professional use. We do not knowingly collect personal data
            from individuals under 18 years of age. If you believe a minor has created an account,
            please contact the Grievance Officer immediately and we will delete the account within 72 hours.
            Processing of children&apos;s data, where applicable (e.g. children listed as HR dependants),
            requires verifiable parental consent per Section 9 of the DPDP Act.
          </p>
        </section>

        {/* 10. Retention */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
            10. Data Retention Policy
          </h2>
          <p className="text-gray-700 mb-4">
            We retain personal data only as long as necessary for the stated purpose or as required
            by Indian law. When you delete your account:
          </p>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2"><span className="text-gray-400 shrink-0 mt-1">▸</span><span><strong>Immediately:</strong> Your login access is revoked. Your data is no longer visible in the product.</span></li>
            <li className="flex items-start gap-2"><span className="text-gray-400 shrink-0 mt-1">▸</span><span><strong>Within 30 days:</strong> All account data, client records, employee records, and documents are permanently deleted from our databases.</span></li>
            <li className="flex items-start gap-2"><span className="text-gray-400 shrink-0 mt-1">▸</span><span><strong>Exception — 7 years:</strong> GST invoices, payment records, and tax-related data are retained as required by the CGST Act and Income Tax Act.</span></li>
            <li className="flex items-start gap-2"><span className="text-gray-400 shrink-0 mt-1">▸</span><span><strong>Exception — 90 days:</strong> Security logs (IP addresses, access logs) are retained for fraud investigation, then auto-deleted.</span></li>
          </ul>
        </section>

        {/* 11. Grievance Officer */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
            11. Grievance Officer
          </h2>
          <p className="text-gray-700 mb-4">
            As required by Section 13 of the DPDP Act, Klaro has appointed a Grievance Officer
            to address your data protection concerns:
          </p>
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {[
                ["Name", "Vikram Chawla"],
                ["Designation", "Founder & Grievance Officer, Klaro"],
                ["Email", "vikramprv@gmail.com"],
                ["Response Time", "Acknowledge within 48 hours, resolve within 30 days"],
                ["Escalation", "Data Protection Board of India — dpboard.gov.in"],
                ["Working Hours", "Monday to Friday, 10am to 6pm IST"],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-gray-500 text-xs mb-0.5">{label}</p>
                  <p className="font-semibold text-gray-900">{value}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            If your grievance is not resolved within 30 days, you may approach the{" "}
            <strong>Data Protection Board of India</strong> at{" "}
            <a href="https://dpboard.gov.in" target="_blank" rel="noopener noreferrer"
              className="text-blue-600 underline">dpboard.gov.in</a>.
          </p>
        </section>

        {/* 12. Changes */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
            12. Changes to This Policy
          </h2>
          <p className="text-gray-700">
            We review this Privacy Policy every 6 months and whenever we introduce a new feature
            that processes personal data. When we make material changes, we will:
          </p>
          <ul className="mt-3 space-y-2 text-gray-700">
            <li className="flex items-start gap-2"><span className="text-gray-400 shrink-0">▸</span>Send an email notification to all registered users at least 14 days before the change takes effect</li>
            <li className="flex items-start gap-2"><span className="text-gray-400 shrink-0">▸</span>Display a notice in the Klaro dashboard for 30 days</li>
            <li className="flex items-start gap-2"><span className="text-gray-400 shrink-0">▸</span>Update the &quot;Effective Date&quot; at the top of this page</li>
          </ul>
          <p className="text-gray-700 mt-3">
            Continued use of Klaro after the effective date of a revised policy constitutes
            acceptance of the updated policy.
          </p>
        </section>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-6 mt-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
            <div>
              <p className="font-medium text-gray-700 mb-1">Effective Date</p>
              <p>{EFFECTIVE_DATE}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700 mb-1">Next Review</p>
              <p>{REVIEW_DATE}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700 mb-1">Version</p>
              <p>1.0 — Initial DPDP-compliant version</p>
            </div>
            <div>
              <p className="font-medium text-gray-700 mb-1">Governing Law</p>
              <p>DPDP Act 2023 &amp; Rules 2025, India</p>
            </div>
          </div>
        </div>

      </div>
    </main>
  )
}
