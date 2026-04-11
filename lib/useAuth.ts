"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "./supabase"

export function useAuth() {
  const router = useRouter()
  const [merchant, setMerchant] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check localStorage first for fast load
    const stored = localStorage.getItem("klaro_merchant")
    if (stored) {
      setMerchant(JSON.parse(stored))
      setLoading(false)
      return
    }

    // Check Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/auth")
        return
      }
      // Get merchant from DB
      supabase.from("merchants").select("*")
        .eq("email", session.user.email!)
        .single()
        .then(({ data }) => {
          if (data) {
            localStorage.setItem("klaro_merchant", JSON.stringify(data))
            setMerchant(data)
          } else {
            router.replace("/auth")
          }
          setLoading(false)
        })
    })
  }, [router])

  const signOut = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem("klaro_merchant")
    router.replace("/auth")
  }

  return { merchant, loading, signOut }
}
