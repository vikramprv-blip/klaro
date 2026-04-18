import "./globals.css";
import { AppToaster } from "@/components/providers/app-toaster"
import { LiveNotificationCenter } from "@/components/notifications/live-notification-center"
import Link from "next/link"
import AppHeader from "@/components/app-header"
import { ToastProvider } from "@/components/toast"

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

        <AppHeader />
<ToastProvider>{children}</ToastProvider></body>
    </html>
  );
}
