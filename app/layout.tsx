import "./globals.css";
import { AppToaster } from "@/components/providers/app-toaster"
import { LiveNotificationCenter } from "@/components/notifications/live-notification-center"
import { ToastProvider } from "@/components/toast"
import { usePathname } from "next/navigation"

export const metadata = {
  title: "Klaro",
  description: "Klaro CA Practice OS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AppToaster />
        <LiveNotificationCenter />

        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}

function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = typeof window !== "undefined" ? window.location.pathname : ""

  const isLanding =
    pathname === "/" || pathname === "/in"

  const AppHeader = require("@/components/app-header").default

  return (
    <>
      {!isLanding && <AppHeader />}
      <ToastProvider>{children}</ToastProvider>
    </>
  )
}
