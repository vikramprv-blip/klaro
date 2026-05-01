import "./globals.css";
import CookieBanner from "./components/CookieBanner";

export const metadata = {
  title: "Klaro",
  description: "Localized professional workflow software by region.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <CookieBanner />
        <footer style={{
          borderTop: '1px solid #1e293b', padding: '16px 24px',
          display: 'flex', justifyContent: 'center', gap: '24px',
          fontSize: '12px', color: '#475569', background: '#0a0f1a'
        }}>
          <a href="/privacy" style={{ color: '#475569', textDecoration: 'none' }}>Privacy Policy</a>
          <a href="/terms" style={{ color: '#475569', textDecoration: 'none' }}>Terms of Service</a>
          <a href="/cookies" style={{ color: '#475569', textDecoration: 'none' }}>Cookie Policy</a>
          <span>© 2026 Klaro Global</span>
        </footer>
      </body>
    </html>
  );
}
