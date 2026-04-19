import Link from "next/link"

export default function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      <Link
        href="/dashboard/live"
        className="px-4 py-2 bg-black text-white rounded-xl"
      >
        Open Live Dashboard
      </Link>
    </div>
  )
}
