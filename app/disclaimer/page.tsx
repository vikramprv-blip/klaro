import Link from "next/link"

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-8 py-16">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 mb-8 block">← Back to Klaro</Link>
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Disclaimer</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: April 21, 2026</p>

        <div className="space-y-8 text-sm text-gray-600 leading-relaxed">

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
            <p className="text-sm text-amber-800 font-medium">Klaro is a software tool, not a professional services firm.</p>
            <p className="text-sm text-amber-700 mt-1">Nothing on this platform constitutes legal, tax, accounting, or financial advice.</p>
          </div>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">No professional advice</h2>
            <p>Klaro provides practice management software to help chartered accountants, lawyers, and their clients organise information and track compliance obligations. The platform, its AI tools, calculators, and content are provided for informational and organisational purposes only.</p>
            <p className="mt-2">Klaro is not a licensed CA firm, law firm, or financial advisor. Use of Klaro does not create a professional-client relationship between you and Klaro Technologies.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">AI tool outputs</h2>
            <p>Klaro's AI features — including the notice reader, penalty calculator, tax optimiser, and document chaser — use large language models to generate outputs based on information you provide. These outputs:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>May contain errors, omissions, or outdated information</li>
              <li>Should always be reviewed by a qualified professional before reliance</li>
              <li>Do not constitute professional advice of any kind</li>
              <li>Are not a substitute for consulting a licensed CA, lawyer, or tax professional</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Compliance information</h2>
            <p>Deadlines, penalty rates, tax slabs, and compliance requirements shown on Klaro are based on our best understanding of Indian law as of the date shown. Tax laws and regulations change frequently. Always verify compliance requirements against official government sources (incometax.gov.in, gst.gov.in, mca.gov.in) or consult a qualified professional.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Accuracy of calculations</h2>
            <p>The penalty calculator and advance tax tools provide estimates only. Actual amounts may differ based on specific facts, applicable exemptions, and the discretion of tax authorities. Do not rely solely on Klaro's calculations for making payments to government portals.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Third-party links</h2>
            <p>Klaro may reference or link to external government portals and third-party resources. We are not responsible for the content, accuracy, or availability of external sites.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Contact</h2>
            <p>If you have questions about this disclaimer: <a href="mailto:legal@klaro.services" className="text-blue-600 hover:underline">legal@klaro.services</a></p>
          </section>

        </div>
      </div>
    </div>
  )
}
