import Link from "next/link";

const SETTINGS_SECTIONS = [
  {
    href: "/settings/company",
    icon: "🏢",
    title: "Company Settings",
    desc: "Firm identity, GST, address, invoice header, WhatsApp sender details.",
  },
  {
    href: "/settings/team",
    icon: "👥",
    title: "Team Members",
    desc: "Add staff, assign roles (Admin, CA, Associate, Intern), manage access.",
  },
  {
    href: "/settings/offices",
    icon: "📍",
    title: "Office Locations",
    desc: "Multiple branches with geo-fencing for attendance punch-in.",
  },
  {
    href: "/settings/invoice",
    icon: "🧾",
    title: "Invoice & Print Settings",
    desc: "Invoice prefix, GST rate, payment terms, bank details, print layout.",
  },
  {
    href: "/settings/data",
    icon: "🔒",
    title: "Data & Privacy",
    desc: "Export your data as CSV, full account export, or delete your account.",
  },
  {
    href: "/settings/billing",
    icon: "💳",
    title: "Subscription & Billing",
    desc: "View your plan, upgrade, download invoices, manage payment method.",
  },
]

export default function SettingsPage() {
  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your firm, team, offices and preferences</p>
      </div>
      <div className="grid gap-3">
        {SETTINGS_SECTIONS.map(s => (
          <Link key={s.href} href={s.href}
            className="flex items-start gap-4 rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md hover:border-gray-200 transition-all">
            <span className="text-2xl mt-0.5">{s.icon}</span>
            <div>
              <h2 className="font-semibold text-gray-900">{s.title}</h2>
              <p className="mt-1 text-sm text-gray-500">{s.desc}</p>
            </div>
            <span className="ml-auto text-gray-300 text-lg mt-0.5">→</span>
          </Link>
        ))}
      </div>
    </main>
  )
}
