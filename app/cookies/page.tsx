import Link from "next/link"

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-8 py-16">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 mb-8 block">← Back to Klaro</Link>
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Cookie Policy</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: April 21, 2026</p>

        <div className="space-y-8 text-sm text-gray-600 leading-relaxed">

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">What are cookies</h2>
            <p>Cookies are small text files stored on your device when you visit a website. They allow websites to remember your preferences and maintain your session.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Cookies we use</h2>
            <div className="border border-gray-100 rounded-xl overflow-hidden mt-3">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-3 font-medium text-gray-700">Cookie</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-700">Purpose</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-700">Duration</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-700">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "sb-access-token", purpose: "Supabase authentication — keeps you signed in", duration: "1 hour", type: "Essential" },
                    { name: "sb-refresh-token", purpose: "Refreshes your authentication session automatically", duration: "30 days", type: "Essential" },
                    { name: "__vercel_live_token", purpose: "Vercel deployment — preview functionality", duration: "Session", type: "Technical" },
                  ].map(({ name, purpose, duration, type }) => (
                    <tr key={name} className="border-b border-gray-50 last:border-0">
                      <td className="px-4 py-3 font-mono text-gray-700">{name}</td>
                      <td className="px-4 py-3 text-gray-500">{purpose}</td>
                      <td className="px-4 py-3 text-gray-500">{duration}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${type === "Essential" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>{type}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">What we do not use</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>No advertising or tracking cookies</li>
              <li>No third-party analytics cookies (e.g. Google Analytics)</li>
              <li>No social media tracking pixels</li>
              <li>No cross-site tracking of any kind</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Managing cookies</h2>
            <p>Essential cookies cannot be disabled as they are required for the platform to function. You can clear all cookies by signing out of Klaro. You can also manage cookies through your browser settings, though this may affect your ability to use the platform.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Contact</h2>
            <p>Questions about our cookie use: <a href="mailto:privacy@klaro.services" className="text-blue-600 hover:underline">privacy@klaro.services</a></p>
          </section>

        </div>
      </div>
    </div>
  )
}
