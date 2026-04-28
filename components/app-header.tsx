"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export default function AppHeader() {
  const pathname = usePathname() || ""
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = "/signin"
  }

  if (pathname === "/" || pathname === "/in") return null

  const inCA     = pathname.startsWith("/in/ca")
  const inLawyer = pathname.startsWith("/in/lawyer")
  const inAdmin  = pathname.startsWith("/admin")
  const isPublic = !inCA && !inLawyer && !inAdmin && !pathname.startsWith("/in/")

  // Context-aware nav items
  const navItems = isPublic ? [
    { href: "/in/ca",     label: "CA Suite" },
    { href: "/in/lawyer", label: "Lawyer Suite" },
    { href: "/pricing",   label: "Pricing" },
    { href: "/guide",     label: "Guide" },
  ] : inCA ? [
    { href: "/in/ca", label: "CA Suite" },
    { href: "/guide#ca", label: "Guide" },
  ] : inLawyer ? [
    { href: "/in/lawyer", label: "Lawyer Suite" },
    { href: "/guide#lawyer", label: "Guide" },
  ] : inAdmin ? [
    { href: "/admin", label: "Admin" },
  ] : [
    { href: "/in/ca",     label: "CA Suite" },
    { href: "/in/lawyer", label: "Lawyer Suite" },
    { href: "/guide",     label: "Guide" },
  ]

  const initials = user?.email?.slice(0, 1).toUpperCase() || "U"
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User"

  return (
    <header className="border-b bg-white sticky top-0 z-40">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link href={user ? (inCA ? "/in/ca" : inLawyer ? "/in/lawyer" : "/") : "/"} className="text-base font-semibold text-gray-900">Klaro</Link>
        <nav className="flex items-center gap-1">
          {navItems.map(({ href, label }) => {
            const active = pathname.startsWith(href.split("#")[0]) && href !== "/"
            return (
              <Link key={href} href={href}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  active ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}>
                {label}
              </Link>
            )
          })}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <div className="relative">
              <button onClick={() => setMenuOpen(o => !o)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50">
                <div className="w-7 h-7 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center font-medium">
                  {initials}
                </div>
                <span className="text-sm text-gray-700 hidden md:block">{displayName}</span>
                <span className="text-gray-400 text-xs">▾</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white border rounded-xl shadow-lg py-1 z-50">
                  <p className="px-4 py-2 text-xs text-gray-400 border-b">{user.email}</p>
                  {inCA && <Link href="/in/ca/settings" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-50">Settings</Link>}
                  {inLawyer && <Link href="/in/lawyer/settings" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-50">Settings</Link>}
                  <Link href="/in/ca" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-50">CA Suite</Link>
                  <Link href="/in/lawyer" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-50">Lawyer Suite</Link>
                  <button onClick={signOut} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50">Sign out</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/signin" className="rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50">Sign in</Link>
              <Link href="/signup" className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700">Get started</Link>
            </>
          )}
          <Link href="/notifications" className="p-2 rounded-lg hover:bg-gray-50">
            <span className="text-lg">🔔</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
