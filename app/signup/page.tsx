import { Suspense } from "react"
import SignupClient from "./client"

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-sm text-gray-400">Loading...</p></div>}>
      <SignupClient />
    </Suspense>
  )
}
