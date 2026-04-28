import "./globals.css";
import { AppToaster } from "@/components/providers/app-toaster"
import { LiveNotificationCenter } from "@/components/notifications/live-notification-center"
import LayoutClient from "@/components/layout-client"
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Klaro — Practice Management for Indian CAs and Lawyers",
    template: "%s | Klaro"
  },
  description: "Klaro is India's complete practice OS for chartered accountants and lawyers. GST, TDS, ITR, eCourts sync, evidence vault, Section 65B certificates, AI tools, HR and billing — all in one platform.",
  keywords: [
    "CA software India", "chartered accountant software", "GST filing software",
    "TDS compliance software", "ITR management software", "lawyer software India",
    "law firm management software", "eCourts case tracking", "Section 65B certificate",
    "evidence vault", "legal practice management India", "CA practice management",
    "GST notice AI", "ROC compliance tracker", "advance tax challan",
    "CA billing software", "legal billing India", "Klaro"
  ],
  authors: [{ name: "Klaro", url: "https://klaro.services" }],
  creator: "Klaro",
  publisher: "Klaro",
  metadataBase: new URL("https://klaro.services"),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://klaro.services",
    siteName: "Klaro",
    title: "Klaro — Practice Management for Indian CAs and Lawyers",
    description: "India's complete practice OS for CAs and lawyers. GST, TDS, ITR, eCourts sync, evidence vault, AI tools, HR and billing — all in one platform.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Klaro — CA and Lawyer Practice Management" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Klaro — Practice Management for Indian CAs and Lawyers",
    description: "India's complete practice OS for CAs and lawyers. GST, TDS, ITR, eCourts sync, AI tools and more.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  verification: {
    google: "add-your-google-search-console-token-here",
  },
  category: "business software",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://klaro.services" />
        <meta name="geo.region" content="IN" />
        <meta name="geo.placename" content="India" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Klaro",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web",
              "description": "Practice management platform for Indian chartered accountants and lawyers. GST filing, TDS compliance, ITR management, eCourts hearing sync, evidence vault with Section 65B certificates.",
              "url": "https://klaro.services",
              "offers": [
                { "@type": "Offer", "name": "CA Solo", "price": "1749", "priceCurrency": "INR", "billingIncrement": "P1M" },
                { "@type": "Offer", "name": "CA Partner", "price": "4249", "priceCurrency": "INR", "billingIncrement": "P1M" },
                { "@type": "Offer", "name": "CA Firm", "price": "24999", "priceCurrency": "INR", "billingIncrement": "P1M" },
                { "@type": "Offer", "name": "Lawyer Solo", "price": "2360", "priceCurrency": "INR", "billingIncrement": "P1M" },
                { "@type": "Offer", "name": "Lawyer Partner", "price": "7080", "priceCurrency": "INR", "billingIncrement": "P1M" },
                { "@type": "Offer", "name": "Lawyer Firm", "price": "34999", "priceCurrency": "INR", "billingIncrement": "P1M" },
              ],
              "provider": {
                "@type": "Organization",
                "name": "Klaro",
                "url": "https://klaro.services",
                "email": "support@klaro.services",
                "areaServed": "IN"
              }
            })
          }}
        />
      </head>
      <body>
        <AppToaster />
        <LiveNotificationCenter />
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}
