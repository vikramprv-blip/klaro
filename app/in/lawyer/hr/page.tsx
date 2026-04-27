"use client"
import Link from "next/link"

const MODULES = [
  { label: "Employees",  href: "/in/lawyer/hr/employees",  icon: "👤", desc: "Manage staff and lawyers" },
  { label: "Attendance", href: "/in/lawyer/hr/attendance",  icon: "📅", desc: "Track daily attendance" },
  { label: "Leave",      href: "/in/lawyer/hr/leave",       icon: "🌴", desc: "Leave requests and approvals" },
  { label: "Payroll",    href: "/in/lawyer/hr/payroll",     icon: "💰", desc: "Salary and payslips" },
  { label: "Timesheets", href: "/in/lawyer/hr/timesheets",  icon: "⏱️", desc: "Billable hours tracking" },
]

export default function LawyerHRPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">HR Module</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your firm's people, attendance and payroll</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MODULES.map(m => (
          <Link key={m.href} href={m.href}
            className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-400 hover:shadow-sm transition-all group">
            <div className="text-3xl mb-3">{m.icon}</div>
            <div className="font-semibold text-gray-900 group-hover:text-black">{m.label}</div>
            <div className="text-xs text-gray-500 mt-1">{m.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
