import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-8 py-16">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 mb-8 block">← Back to Klaro</Link>
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: April 21, 2026</p>

        <div className="space-y-8 text-sm text-gray-600 leading-relaxed">

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">1. Acceptance</h2>
            <p>By creating a Klaro account or using the Klaro platform, you agree to these Terms of Service. If you are using Klaro on behalf of a firm or organisation, you represent that you have authority to bind that organisation to these terms.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">2. The service</h2>
            <p>Klaro provides practice management software for chartered accountants and lawyers in India. The platform includes compliance tracking, deadline management, document storage, and AI-assisted tools. We are a technology platform, not a licensed CA firm or law firm, and nothing on Klaro constitutes professional legal or tax advice.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">3. Beta period</h2>
            <p>Klaro is currently in beta. During this period, the service is provided free of charge. We reserve the right to introduce paid plans with at least 30 days notice. Beta users will receive preferential pricing.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">4. Your account</h2>
            <p>You are responsible for maintaining the security of your account credentials and for all activity that occurs under your account. You must notify us immediately of any unauthorised access. You must be at least 18 years old to use Klaro.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">5. Your data</h2>
            <p>You retain ownership of all data you enter into Klaro, including client information and documents. By using Klaro, you grant us a limited licence to process this data solely to provide the service. We do not claim ownership of your data and will not use it for any other purpose.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">6. Acceptable use</h2>
            <p>You agree not to use Klaro to: store or process data you do not have the right to process; attempt to reverse-engineer or compromise the platform; use the service for any unlawful purpose; or impersonate another person or entity.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">7. AI tools disclaimer</h2>
            <p>Klaro's AI features (notice reader, tax optimiser, etc.) are provided as productivity aids only. Outputs from AI tools should be reviewed and verified by a qualified professional before use. Klaro makes no warranties about the accuracy, completeness, or fitness of AI-generated content for any specific purpose.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">8. Limitation of liability</h2>
            <p>To the maximum extent permitted by applicable law, Klaro's liability for any claim arising from use of the platform is limited to the amount you paid us in the 3 months preceding the claim. We are not liable for indirect, incidental, or consequential damages including loss of profits, data, or client relationships.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">9. Termination</h2>
            <p>You may terminate your account at any time by contacting support. We may suspend or terminate accounts that violate these terms. Upon termination, you may export your data within 30 days before it is deleted.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">10. Governing law</h2>
            <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in New Delhi, India.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">11. Contact</h2>
            <p>Questions about these terms: <a href="mailto:legal@klaro.services" className="text-blue-600 hover:underline">legal@klaro.services</a></p>
          </section>

        </div>
      </div>
    </div>
  )
}
