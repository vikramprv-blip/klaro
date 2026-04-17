import { ClientSelect } from "@/components/work-items/client-select"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import NewWorkItemForm from "@/components/new-work-item-form"

export default async function NewWorkItemPage() {
  const clients = await prisma.client.findMany({
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
    },
  })

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <div className="mb-2 text-sm text-gray-500">
            <Link href="/workboard" className="hover:underline">
              Workboard
            </Link>
            <span className="mx-2">/</span>
            <span>New Work Item</span>
          </div>
          <h1 className="text-3xl font-semibold">New Work Item</h1>
        </div>

        <Link
          href="/workboard"
          className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
        >
          Back to Workboard
        </Link>
      </div>

      <NewWorkItemForm clients={clients} />
    </main>
  )
}
