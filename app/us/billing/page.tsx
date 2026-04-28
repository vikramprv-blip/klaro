import { UsBillingCard } from "@/app/us/components/us-billing-card"

export default function UsBillingPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <p className="text-sm font-medium text-slate-500">Klaro US</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            Billing & Storage
          </h1>
          <p className="mt-2 text-slate-600">
            Manage your US portal plan, billing status, and document vault storage.
          </p>
        </div>

        <UsBillingCard />
      </div>
    </main>
  )
}
