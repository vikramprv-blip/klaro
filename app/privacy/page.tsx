import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-8 py-16">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 mb-8 block">← Back to Klaro</Link>
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: April 21, 2026</p>

        <div className="prose prose-gray max-w-none space-y-8 text-sm text-gray-600 leading-relaxed">

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">1. Who we are</h2>
            <p>Klaro is a practice management platform for Indian chartered accountants and law firms, operated by Klaro Technologies (a sole proprietorship registered in India). Our registered address and contact details are available at the bottom of this page.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">2. What data we collect</h2>
            <p>We collect only what is necessary to provide the service:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Account data:</strong> Your name, email address, firm name, and the vertical you selected (CA or Lawyer) when you sign up.</li>
              <li><strong>Client data you enter:</strong> Names, PANs, GSTINs, case details, and filing records that you add for your own clients. This data belongs to you.</li>
              <li><strong>Usage data:</strong> Pages visited, features used, and error logs — collected anonymously to improve the product.</li>
              <li><strong>Documents you upload:</strong> Files uploaded to AI services (notice PDFs, 26AS, financials) are processed in your browser or transiently on our servers and are not stored beyond the session.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">3. How we use your data</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To provide and improve the Klaro service</li>
              <li>To send product updates, compliance reminders, and support communications</li>
              <li>To analyse aggregate usage patterns (never individual client data)</li>
              <li>We never sell your data to third parties</li>
              <li>We never use your client data to train AI models</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">4. Data storage and security</h2>
            <p>Your data is stored on Supabase (hosted on AWS, Mumbai region where available). All data is encrypted at rest (AES-256) and in transit (TLS 1.2+). We implement row-level security to ensure your data is only accessible to your account.</p>
            <p className="mt-2">We conduct regular security reviews and maintain automatic daily backups with point-in-time recovery.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">5. AI services and third parties</h2>
            <p>Our AI features use Groq's API (llama-3.3-70b-versatile model). Text you submit to AI services is sent to Groq for processing. Groq's privacy policy applies to this processing. We do not send client PAN, Aadhaar, or bank account numbers to any AI service — we recommend redacting sensitive identifiers before uploading documents.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">6. Your rights</h2>
            <p>You have the right to access, correct, export, or delete your data at any time. To exercise these rights, email us at <a href="mailto:privacy@klaro.services" className="text-blue-600 hover:underline">privacy@klaro.services</a>. We will respond within 30 days.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">7. Data retention</h2>
            <p>We retain your account and client data for as long as your account is active. If you delete your account, all associated data is permanently deleted within 30 days. Anonymised aggregate data may be retained indefinitely.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">8. Cookies</h2>
            <p>We use essential cookies for authentication and session management. See our <Link href="/cookies" className="text-blue-600 hover:underline">Cookie Policy</Link> for details.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">9. Changes to this policy</h2>
            <p>We will notify you by email of material changes to this policy at least 30 days before they take effect.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">10. Contact</h2>
            <p>For privacy-related queries: <a href="mailto:privacy@klaro.services" className="text-blue-600 hover:underline">privacy@klaro.services</a><br />
            For general support: <a href="mailto:support@klaro.services" className="text-blue-600 hover:underline">support@klaro.services</a></p>
          </section>

        </div>
      </div>
    </div>
  )
}
