export default function BillingPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="rounded-2xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-gray-500">Klaro Billing</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Upgrade to unlock Klaro
        </h1>
        <p className="mt-4 text-gray-600">
          Your account is currently on the free plan. Upgrade to continue using paid Klaro features.
        </p>

        <div className="mt-8 rounded-xl border bg-gray-50 p-6">
          <h2 className="text-xl font-semibold">Paid access</h2>
          <p className="mt-2 text-gray-600">
            Client workflows, compliance automation, document AI, reminders, and revenue features are locked for unpaid users.
          </p>
          <a
            href="mailto:support@klaro.services?subject=Upgrade Klaro account"
            className="mt-6 inline-flex rounded-lg bg-black px-5 py-3 text-sm font-medium text-white"
          >
            Contact to upgrade
          </a>
        </div>
      </div>
    </main>
  )
}
