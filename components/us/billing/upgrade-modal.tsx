export default function UpgradeModal({ locked }: { locked: boolean }) {
  if (!locked) return null;

  return (
    <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-4">
      <p className="font-semibold text-yellow-800">Upgrade required</p>
      <p className="mt-1 text-sm text-yellow-700">
        You have reached the Starter document limit. Upgrade to Pro to continue.
      </p>
      <a
        href="/us/billing"
        className="mt-3 inline-block rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium text-white"
      >
        Upgrade to Pro
      </a>
    </div>
  );
}
