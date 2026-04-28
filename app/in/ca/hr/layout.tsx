"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

const HR_NAV = [
  { label: "Overview",    href: "/in/ca/hr" },
  { label: "Employees",   href: "/in/ca/hr/employees" },
  { label: "Payroll",     href: "/in/ca/hr/payroll" },
  { label: "Attendance",  href: "/in/ca/hr/attendance" },
  { label: "Leave",       href: "/in/ca/hr/leave" },
  { label: "Timesheets",  href: "/in/ca/hr/timesheets" },
  { label: "Branches",    href: "/in/ca/hr/branches" },
]

export default function HRLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname() || ""
  return (
    <div className="flex flex-col min-h-full">
      <div className="border-b bg-white px-8 pt-6">
        <h1 className="text-xl font-bold text-gray-900 mb-3">HR Module</h1>
        <div className="flex gap-1">
          {HR_NAV.map(({ label, href }) => {
            const active = path === href || (href !== "/in/ca/hr" && path.startsWith(href))
            return (
              <Link key={href} href={href}
                className={`px-4 py-2 text-sm rounded-t-lg border-b-2 transition-colors ${
                  active ? "border-gray-900 text-gray-900 font-medium" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}>
                {label}
              </Link>
            )
          })}
        </div>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  )
}
