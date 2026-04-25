export default function AttendancePage() {
  return (
    <main className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Attendance</h1>
        <p className="text-sm text-gray-600">Track attendance, check-in, check-out, and leave status.</p>
      </div>

      <form className="grid gap-4 rounded-xl border p-5 md:grid-cols-2">
        <input name="employeeId" placeholder="Employee ID" className="rounded border px-3 py-2" />
        <input name="date" type="date" className="rounded border px-3 py-2" />
        <input name="checkIn" type="datetime-local" className="rounded border px-3 py-2" />
        <input name="checkOut" type="datetime-local" className="rounded border px-3 py-2" />
        <select name="status" className="rounded border px-3 py-2">
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="leave">Leave</option>
        </select>
        <input name="notes" placeholder="Notes" className="rounded border px-3 py-2" />
        <button className="rounded bg-black px-4 py-2 text-white md:col-span-2">
          Add Attendance
        </button>
      </form>

      <section className="rounded-xl border p-5">
        <h2 className="font-semibold">Attendance Records</h2>
        <p className="mt-2 text-sm text-gray-600">Attendance table will connect to HR API next.</p>
      </section>
    </main>
  )
}
