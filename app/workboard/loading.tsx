export default function Loading() {
  return (
    <div className="p-6">
      <div className="h-8 w-48 animate-pulse rounded bg-zinc-200" />
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border p-4">
            <div className="h-6 w-24 animate-pulse rounded bg-zinc-200" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 3 }).map((__, j) => (
                <div
                  key={j}
                  className="h-28 animate-pulse rounded-xl bg-zinc-100"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
