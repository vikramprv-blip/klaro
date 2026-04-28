"use client";

export default function BlockerFilter({
  showBlockedOnly,
  setShowBlockedOnly,
}: {
  showBlockedOnly: boolean;
  setShowBlockedOnly: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => setShowBlockedOnly(!showBlockedOnly)}
      className={`rounded-lg border px-4 py-2 text-sm font-medium ${
        showBlockedOnly
          ? "border-red-300 bg-red-50 text-red-700"
          : "border-gray-200 bg-white text-gray-700"
      }`}
    >
      {showBlockedOnly ? "Showing blocked only" : "Show blocked only"}
    </button>
  );
}
