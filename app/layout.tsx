import "./globals.css";
import { AppToaster } from "@/components/providers/app-toaster"
import { LiveNotificationCenter } from "@/components/notifications/live-notification-center"
import LayoutClient from "@/components/layout-client"

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
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}
