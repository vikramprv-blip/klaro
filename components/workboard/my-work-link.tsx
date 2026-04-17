import Link from "next/link"

export function MyWorkLink({ userId }: { userId: string }) {
  return (
    <Link
      href={`/my-work?userId=${userId}`}
      className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium"
    >
      My work
    </Link>
  )
}
