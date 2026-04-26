import Link from "next/link"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-8 py-16">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 mb-8 block">← Back to Klaro</Link>
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Contact Us</h1>
        <p className="text-sm text-gray-400 mb-10">We are here to help</p>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="rounded-2xl border p-6">
            <div className="text-2xl mb-3">💬</div>
            <h2 className="font-semibold text-gray-900 mb-1">General Support</h2>
            <p className="text-sm text-gray-500 mb-3">Questions about your account, billing, or features.</p>
            <a href="mailto:support@klaro.services"
              className="text-sm text-blue-600 hover:underline">support@klaro.services</a>
          </div>

          <div className="rounded-2xl border p-6">
            <div className="text-2xl mb-3">🛡️</div>
            <h2 className="font-semibold text-gray-900 mb-1">Privacy & Legal</h2>
            <p className="text-sm text-gray-500 mb-3">Data requests, GDPR, or legal inquiries.</p>
            <a href="mailto:legal@klaro.services"
              className="text-sm text-blue-600 hover:underline">legal@klaro.services</a>
          </div>

          <div className="rounded-2xl border p-6">
            <div className="text-2xl mb-3">🚀</div>
            <h2 className="font-semibold text-gray-900 mb-1">Sales & Partnerships</h2>
            <p className="text-sm text-gray-500 mb-3">Pricing, enterprise plans, or partnerships.</p>
            <a href="mailto:vikramprv@gmail.com"
              className="text-sm text-blue-600 hover:underline">vikramprv@gmail.com</a>
          </div>

          <div className="rounded-2xl border p-6">
            <div className="text-2xl mb-3">🐛</div>
            <h2 className="font-semibold text-gray-900 mb-1">Bug Reports</h2>
            <p className="text-sm text-gray-500 mb-3">Found an issue? Report it directly on GitHub.</p>
            <a href="https://github.com/vikramprv-blip/klaro/issues"
              target="_blank" rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline">Open a GitHub issue →</a>
          </div>
        </div>

        <div className="rounded-2xl bg-gray-50 border p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Response Times</h2>
          <p className="text-sm text-gray-500">
            Support emails are answered within 24 hours on business days (Mon–Fri, 9am–6pm IST).
            For urgent issues, mention <strong>URGENT</strong> in your subject line.
          </p>
        </div>
      </div>
    </div>
  )
}
