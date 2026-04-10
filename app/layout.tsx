import type { Metadata, Viewport } from "next"
import "./globals.css"
import CookieBanner from "../components/CookieBanner"

export const metadata: Metadata = {
  title: "Klaro — Smart Financial Tools",
  description: "Financial tools built for freelancers and small businesses in India and Southeast Asia.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Klaro" },
}

export const viewport: Viewport = {
  themeColor: "#6366F1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body>
        {children}
        <CookieBanner />
      </body>
    </html>
  )
}
