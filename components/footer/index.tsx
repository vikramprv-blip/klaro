"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

const FOOTER_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Cookie Policy", href: "/cookies" },
  { label: "Contact", href: "/contact" },
]

const HIDE_ON = ["/signin", "/signup", "/onboarding", "/post-login", "/in/"]

export default function Footer() {
  const path = usePathname() || ""
  const hide = HIDE_ON.some(p => path.startsWith(p))
  if (hide) return null

  return (
    <footer className="border-t border-gray-100 bg-white mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900">Klaro</span>
            <span className="text-gray-300">·</span>
            <span className="text-sm text-gray-400">CA Practice OS</span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-6">
            {FOOTER_LINKS.map(l => (
              <Link key={l.href} href={l.href}
                className="text-sm text-gray-400 hover:text-gray-700 transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>
          <p className="text-xs text-gray-300">
            © {new Date().getFullYear()} Klaro. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
