import Link from "next/link";

export default function SettingsPage() {
  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <div className="mt-6 grid gap-4">
        <Link href="/settings/company" className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="font-semibold">Company Settings</h2>
          <p className="mt-1 text-sm text-gray-600">
            Setup firm identity for invoices, WhatsApp sender details, GST, address, and compliance.
          </p>
        </Link>
      </div>
    </main>
  );
}
