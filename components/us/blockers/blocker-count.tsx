export default function BlockerCount({ count }: { count: number }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
      <p className="text-sm font-medium text-red-700">Client blockers</p>
      <p className="mt-1 text-3xl font-bold text-red-800">{count}</p>
      <p className="mt-1 text-xs text-red-600">
        items currently holding up work
      </p>
    </div>
  );
}
