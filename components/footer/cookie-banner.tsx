"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

export default function CookieBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem("klaro:cookie-consent")
    if (!consent) setShow(true)
  }, [])

  function accept() {
    localStorage.setItem("klaro:cookie-consent", "accepted")
    setShow(false)
  }

  function decline() {
    localStorage.setItem("klaro:cookie-consent", "declined")
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="max-w-4xl mx-auto bg-gray-900 text-white rounded-2xl shadow-2xl px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-300 flex-1">
          We use cookies to improve your experience on Klaro. By continuing, you agree to our{" "}
          <Link href="/cookies" className="text-white underline hover:no-underline">Cookie Policy</Link>
          {" "}and{" "}
          <Link href="/privacy" className="text-white underline hover:no-underline">Privacy Policy</Link>.
        </p>
        <div className="flex gap-2 shrink-0">
          <button onClick={decline}
            className="px-4 py-2 text-sm border border-gray-600 text-gray-300 rounded-xl hover:border-gray-400">
            Decline
          </button>
          <button onClick={accept}
            className="px-4 py-2 text-sm bg-white text-gray-900 rounded-xl font-medium hover:bg-gray-100">
            Accept All
          </button>
        </div>
      </div>
    </div>
  )
}
