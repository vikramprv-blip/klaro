import Link from "next/link"

export default function HRPage() {
  return (
    <main className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">HR + Compliance</h1>
        <p className="text-sm text-gray-600">
          Manage employees, attendance, payroll, and HR audit readiness.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/admin/hr/employees" className="rounded-xl border p-5 hover:bg-gray-50">
          <h2 className="font-semibold">Employees</h2>
          <p className="text-sm text-gray-600">Employee master records and roles.</p>
        </Link>

        <Link href="/admin/hr/attendance" className="rounded-xl border p-5 hover:bg-gray-50">
          <h2 className="font-semibold">Attendance</h2>
          <p className="text-sm text-gray-600">Daily attendance and leave tracking.</p>
        </Link>

        <Link href="/admin/hr/payroll" className="rounded-xl border p-5 hover:bg-gray-50">
          <h2 className="font-semibold">Payroll</h2>
          <p className="text-sm text-gray-600">Payroll records, deductions, and payouts.</p>
        </Link>
      </div>
    </main>
  )
}
