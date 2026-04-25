export default function PayrollPage() {
  return (
    <main className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Payroll</h1>
        <p className="text-sm text-gray-600">Manage monthly payroll, deductions, bonuses, and payout status.</p>
      </div>

      <form className="grid gap-4 rounded-xl border p-5 md:grid-cols-2">
        <input name="employeeId" placeholder="Employee ID" className="rounded border px-3 py-2" />
        <input name="month" placeholder="Month e.g. 2026-04" className="rounded border px-3 py-2" />
        <input name="baseSalary" placeholder="Base salary" className="rounded border px-3 py-2" />
        <input name="deductions" placeholder="Deductions" className="rounded border px-3 py-2" />
        <input name="bonus" placeholder="Bonus" className="rounded border px-3 py-2" />
        <select name="status" className="rounded border px-3 py-2">
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
        </select>
        <button className="rounded bg-black px-4 py-2 text-white md:col-span-2">
          Add Payroll
        </button>
      </form>

      <section className="rounded-xl border p-5">
        <h2 className="font-semibold">Payroll Records</h2>
        <p className="mt-2 text-sm text-gray-600">Payroll table will connect to HR API next.</p>
      </section>
    </main>
  )
}
