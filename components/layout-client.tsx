"use client"

import { usePathname } from "next/navigation"
import AppHeader from "@/components/app-header"
import { ToastProvider } from "@/components/toast"

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const isLanding =
    pathname === "/" || pathname === "/in"

  return (
    <>
      {!isLanding && <AppHeader />}
      <ToastProvider>{children}</ToastProvider>
    </>
  )
}
