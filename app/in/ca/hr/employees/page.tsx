export default function EmployeesPage() {
  return (
    <main className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Employees</h1>
        <p className="text-sm text-gray-600">Manage employee records for HR + Compliance.</p>
      </div>

      <form className="grid gap-4 rounded-xl border p-5 md:grid-cols-2">
        <input name="name" placeholder="Employee name" className="rounded border px-3 py-2" />
        <input name="email" placeholder="Email" className="rounded border px-3 py-2" />
        <input name="phone" placeholder="Phone" className="rounded border px-3 py-2" />
        <input name="role" placeholder="Role" className="rounded border px-3 py-2" />
        <input name="department" placeholder="Department" className="rounded border px-3 py-2" />
        <input name="salary" placeholder="Salary" className="rounded border px-3 py-2" />
        <button className="rounded bg-black px-4 py-2 text-white md:col-span-2">
          Add Employee
        </button>
      </form>

      <section className="rounded-xl border p-5">
        <h2 className="font-semibold">Employee List</h2>
        <p className="mt-2 text-sm text-gray-600">Employee table will connect to HR API next.</p>
      </section>
    </main>
  )
}
