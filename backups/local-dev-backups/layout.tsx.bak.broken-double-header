import Link from "next/link";

export default function IndiaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-slate-950">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/in" className="text-lg font-bold">
            Klaro India
          </Link>

          <nav className="flex items-center gap-5 text-sm text-slate-600">
            <Link href="/in">Home</Link>
            <Link href="/in/ca">CA Suite</Link>
            <Link href="/in/lawyer">Lawyer Suite</Link>
          </nav>
        </div>
      </header>

      {children}
    </div>
  );
}
