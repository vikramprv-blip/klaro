"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
export default function OldNewClientRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace("/in/ca/clients/new") }, [router])
  return <div className="p-8 text-gray-400">Redirecting...</div>
}
