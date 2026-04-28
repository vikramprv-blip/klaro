import Link from "next/link";

export default function USLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/us" className="text-lg font-bold">
            Klaro US
          </Link>

          <nav className="flex items-center gap-5 text-sm text-slate-600">
            <Link href="/us">Home</Link>
            <Link href="/us/documents">Documents</Link>
            <Link href="/us/billing">Billing</Link>
            <Link href="/us/billing/upgrade" className="rounded-xl bg-slate-950 px-4 py-2 text-white">
              Upgrade
            </Link>
          </nav>
        </div>
      </header>

      {children}
    </div>
  );
}
