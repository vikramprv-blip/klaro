"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface SuiteTopbarProps {
  suite: "ca" | "lawyer"
  hasCA?: boolean
  hasLawyer?: boolean
}

export default function SuiteTopbar({ suite, hasCA = true, hasLawyer = true }: SuiteTopbarProps) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = "/signin"
  }

  return (
    <div className="h-10 border-b border-gray-100 bg-white flex items-center justify-between px-4 shrink-0 z-10">
      <div className="flex items-center gap-2">
        <Link href="/" className="text-sm font-bold text-gray-900 mr-2">Klaro</Link>
        {hasCA && (
          <Link
            href="/in/ca"
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              suite === "ca"
                ? "bg-gray-900 text-white"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 border border-gray-200"
            }`}
          >
            CA Suite
          </Link>
        )}
        {hasLawyer && (
          <Link
            href="/in/lawyer"
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              suite === "lawyer"
                ? "bg-gray-900 text-white"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 border border-gray-200"
            }`}
          >
            Lawyer Suite
          </Link>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Link href={suite === "ca" ? "/in/ca/settings" : "/in/lawyer/settings"}
          className="px-3 py-1 text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
          ⚙ Settings
        </Link>
        <button
          onClick={handleLogout}
          className="px-3 py-1 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors border border-gray-200"
        >
          Logout
        </button>
      </div>
    </div>
  )
}
