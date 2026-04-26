"use client"
import { usePathname } from "next/navigation"
import AppHeader from "@/components/app-header"
import { ToastProvider } from "@/components/toast"
import Footer from "@/components/footer/index"
import CookieBanner from "@/components/footer/cookie-banner"

const HIDE_HEADER = ["/signin", "/signup", "/onboarding", "/post-login"]

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || ""
  const isLanding = pathname === "/" || pathname === "/in"
  const hideHeader = isLanding || HIDE_HEADER.some(p => pathname.startsWith(p))

  return (
    <div className="flex flex-col min-h-screen">
      {!hideHeader && <AppHeader />}
      <ToastProvider>
        <div className="flex-1">
          {children}
        </div>
      </ToastProvider>
      <Footer />
      <CookieBanner />
    </div>
  )
}
