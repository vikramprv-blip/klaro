import Link from "next/link"

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-8 py-16">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 mb-8 block">← Back to Klaro</Link>
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Cookie Policy</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: April 26, 2026</p>

        <div className="prose prose-gray max-w-none space-y-8 text-sm text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">What are cookies?</h2>
            <p>Cookies are small text files stored on your device when you visit Klaro. They help us remember your preferences, keep you signed in, and understand how you use our product.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Cookies we use</h2>
            <div className="border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Cookie</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Purpose</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[
                    ["sb-access-token", "Supabase authentication session", "1 hour"],
                    ["sb-refresh-token", "Keeps you signed in", "30 days"],
                    ["klaro:cookie-consent", "Stores your cookie preference", "1 year"],
                    ["klaro:signup", "Remembers your signup intent", "Session"],
                  ].map(([name, purpose, duration]) => (
                    <tr key={name} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{name}</td>
                      <td className="px-4 py-3">{purpose}</td>
                      <td className="px-4 py-3 text-gray-400">{duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Third-party cookies</h2>
            <p>We use Supabase for authentication and Vercel for hosting. These services may set their own cookies. We do not use advertising or tracking cookies.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Managing cookies</h2>
            <p>You can clear cookies at any time in your browser settings. Note that disabling authentication cookies will sign you out of Klaro. You can also update your cookie preference at any time by clearing the <code className="bg-gray-100 px-1 rounded">klaro:cookie-consent</code> item from your browser's local storage.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Contact</h2>
            <p>Questions about cookies? Email us at <a href="mailto:legal@klaro.services" className="text-blue-600 hover:underline">legal@klaro.services</a> or visit our <Link href="/contact" className="text-blue-600 hover:underline">Contact page</Link>.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
