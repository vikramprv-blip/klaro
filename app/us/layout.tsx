import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  metadataBase: new URL("https://klaro.services"),
  title: {
    default: "Klaro — Practice Management for US Lawyers & CPAs",
    template: "%s | Klaro US",
  },
  description: "Klaro eliminates blocker blindness between law firms and CPA firms. AI-powered practice management for US attorneys and accountants — cross-firm collaboration, predictive AI, audit-ready compliance trails.",
  keywords: ["legal practice management software", "CPA practice management", "law firm software", "attorney case management", "accountant workflow software", "cross-firm collaboration", "legal AI software USA"],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://klaro.services/us",
    siteName: "Klaro",
    title: "Klaro — Practice Management for US Lawyers & CPAs",
    description: "Eliminate blocker blindness. AI-powered practice management that connects law firms and CPA firms working on the same client.",
    images: [{ url: "/og-us.png", width: 1200, height: 630, alt: "Klaro US — Practice Management" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Klaro — Practice Management for US Lawyers & CPAs",
    description: "AI-powered practice management that eliminates blocker blindness between law firms and CPA firms.",
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  alternates: { canonical: "https://klaro.services/us" },
}

export default function USLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="border-b border-gray-100 bg-white sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/us" className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">Klaro</span>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">US</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <Link href="/us#features" className="hover:text-gray-900 transition-colors">Features</Link>
            <Link href="/us#pricing" className="hover:text-gray-900 transition-colors">Pricing</Link>
            <Link href="/us#sentinel" className="hover:text-gray-900 transition-colors">Klaro Sentinel</Link>
            <Link href="/guide" className="hover:text-gray-900 transition-colors">Guide</Link>
            <Link href="/us/signin" className="hover:text-gray-900 transition-colors">Sign in</Link>
            <Link href="/us/signup"
              className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium">
              Start free trial
            </Link>
          </nav>
          <Link href="/us/signup" className="md:hidden bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium">
            Get started
          </Link>
        </div>
      </header>
      {children}
      <footer className="border-t border-gray-100 bg-gray-50 mt-24">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <p className="font-bold text-gray-900 mb-3">Klaro</p>
              <p className="text-xs text-gray-500 leading-relaxed">Practice management for US attorneys and CPAs. Built to eliminate workflow friction between professional services firms.</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">Product</p>
              <div className="space-y-2 text-sm text-gray-500">
                <Link href="/us#features" className="block hover:text-gray-900">Features</Link>
                <Link href="/us#pricing" className="block hover:text-gray-900">Pricing</Link>
                <Link href="/us#sentinel" className="block hover:text-gray-900">Klaro Sentinel AI</Link>
                <Link href="/guide" className="block hover:text-gray-900">User Guide</Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">For Firms</p>
              <div className="space-y-2 text-sm text-gray-500">
                <Link href="/us#lawyers" className="block hover:text-gray-900">Law Firms</Link>
                <Link href="/us#cpas" className="block hover:text-gray-900">CPA Firms</Link>
                <Link href="/us#crossfirm" className="block hover:text-gray-900">Cross-Firm Collaboration</Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">Company</p>
              <div className="space-y-2 text-sm text-gray-500">
                <Link href="/" className="block hover:text-gray-900">India Suite</Link>
                <a href="mailto:us@klaro.services" className="block hover:text-gray-900">us@klaro.services</a>
                <Link href="/terms" className="block hover:text-gray-900">Terms</Link>
                <Link href="/privacy" className="block hover:text-gray-900">Privacy</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-xs text-gray-400">© {new Date().getFullYear()} Klaro Tech. All rights reserved.</p>
            <p className="text-xs text-gray-400">SOC 2 in progress · Data hosted in US-East · HIPAA-ready infrastructure</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
