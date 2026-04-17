"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/toast"

type Props = {
  id: string
  isArchived: boolean
}

export default function WorkItemDangerZone({ id, isArchived }: Props) {
  const router = useRouter()
  const { showToast } = useToast()
  const [isPending, startTransition] = useTransition()

  async function archiveItem() {
    const ok = window.confirm(
      isArchived
        ? "Unarchive this work item?"
        : "Archive this work item? It will be hidden from normal lists."
    )
    if (!ok) return

    const res = await fetch(`/api/work-items/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        archivedAt: isArchived ? null : new Date().toISOString(),
      }),
    })

    if (!res.ok) {
      showToast("Failed to update archive status", "error")
      return
    }

    showToast("Archive status updated")

    showToast("Work item deleted")

    startTransition(() => {
      router.push("/workboard")
      router.refresh()
    })
  }

  async function deleteItem() {
    const ok = window.confirm(
      "Delete this work item permanently? This cannot be undone."
    )
    if (!ok) return

    const res = await fetch(`/api/work-items/${id}`, {
      method: "DELETE",
    })

    if (!res.ok) {
      showToast("Failed to delete work item", "error")
      return
    }

    startTransition(() => {
      router.push("/workboard")
      router.refresh()
    })
  }

  return (
    <section className="rounded-xl border border-red-200 bg-red-50 p-5">
      <h2 className="mb-3 text-lg font-semibold text-red-700">Danger zone</h2>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={archiveItem}
          disabled={isPending}
          className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm hover:bg-red-100 disabled:opacity-50"
        >
          {isArchived ? "Unarchive" : "Archive"}
        </button>

        <button
          type="button"
          onClick={deleteItem}
          disabled={isPending}
          className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
        >
          Delete permanently
        </button>
      </div>
    </section>
  )
}
