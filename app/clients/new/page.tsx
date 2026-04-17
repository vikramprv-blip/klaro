import Link from "next/link"

export default function NewClientPage() {
  return (
    <div className="mx-auto max-w-3xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">New Client</h1>
        <Link href="/clients" className="rounded-md border px-3 py-2 text-sm">
          Back to Clients
        </Link>
      </div>

      <p className="text-sm text-neutral-600">
        Add your client creation form here, or reuse your existing client form component.
      </p>
    </div>
  )
}
