export default function CADashboard() {
  return (
    <main className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">CA Suite</h1>
        <p className="text-sm text-gray-500 mt-1">
          Welcome to Klaro. Your test workspace is active.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <a href="/in/ca/clients" className="border rounded-2xl p-5 hover:bg-gray-50">
          <h2 className="font-medium">Clients</h2>
          <p className="text-sm text-gray-500 mt-1">Manage client master data.</p>
        </a>

        <a href="/in/ca/compliance" className="border rounded-2xl p-5 hover:bg-gray-50">
          <h2 className="font-medium">Compliance</h2>
          <p className="text-sm text-gray-500 mt-1">Track GST, TDS and ITR tasks.</p>
        </a>

        <a href="/in/ca/documents" className="border rounded-2xl p-5 hover:bg-gray-50">
          <h2 className="font-medium">Documents</h2>
          <p className="text-sm text-gray-500 mt-1">Upload and manage documents.</p>
        </a>
      </div>
    </main>
  );
}
