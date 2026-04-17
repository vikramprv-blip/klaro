"use client"

import { useEffect, useMemo, useState } from "react"

type WorkItem = {
  id: string
  title: string
  status: string
  priority: string
  dueDate: string | null
  client?: {
    name: string
  } | null
}

type DashboardResponse = {
  metrics: {
    total: number
    pending: number
    inProgress: number
    done: number
    overdue: number
    highPriority?: number
    urgent?: number
  }
  overdueItems: WorkItem[]
  workItems: WorkItem[]
}

const emptyData: DashboardResponse = {
  metrics: {
    total: 0,
    pending: 0,
    inProgress: 0,
    done: 0,
    overdue: 0,
    highPriority: 0,
    urgent: 0,
  },
  overdueItems: [],
  workItems: [],
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResponse>(emptyData)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/dashboard/metrics", {
          cache: "no-store",
        })
        const json = await res.json()
        setData({
          metrics: {
            total: json.metrics?.total ?? 0,
            pending: json.metrics?.pending ?? 0,
            inProgress: json.metrics?.inProgress ?? 0,
            done: json.metrics?.done ?? 0,
            overdue: json.metrics?.overdue ?? 0,
            highPriority: json.metrics?.highPriority ?? 0,
            urgent: json.metrics?.urgent ?? 0,
          },
          overdueItems: Array.isArray(json.overdueItems) ? json.overdueItems : [],
          workItems: Array.isArray(json.workItems) ? json.workItems : [],
        })
      } catch {
        setData(emptyData)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const topOpenItems = useMemo(() => {
    return data.workItems
      .filter((item) => item.status !== "DONE")
      .slice(0, 5)
  }, [data.workItems])

  const metrics = [
    { label: "Open items", value: data.metrics.total - data.metrics.done },
    { label: "Pending", value: data.metrics.pending },
    { label: "In progress", value: data.metrics.inProgress },
    { label: "Done", value: data.metrics.done },
    { label: "Overdue", value: data.metrics.overdue },
    { label: "High priority", value: data.metrics.highPriority ?? 0 },
    { label: "Urgent", value: data.metrics.urgent ?? 0 },
  ]

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Quick snapshot of work health, overdue items, and team focus.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="text-sm text-neutral-500">{metric.label}</div>
            <div className="mt-3 text-4xl font-semibold tracking-tight">
              {loading ? "—" : metric.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Overdue</h2>
            <span className="text-sm text-neutral-500">
              {data.overdueItems.length} item{data.overdueItems.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {loading ? (
              <div className="text-sm text-neutral-500">Loading overdue items...</div>
            ) : data.overdueItems.length === 0 ? (
              <div className="rounded-xl border border-dashed p-4 text-sm text-neutral-500">
                No overdue work items.
              </div>
            ) : (
              data.overdueItems.map((item) => (
                <div key={item.id} className="rounded-xl border p-4">
                  <div className="font-medium">{item.title}</div>
                  <div className="mt-1 text-sm text-neutral-600">
                    {item.client?.name || "No client"} • {item.status} • {item.priority}
                  </div>
                  {item.dueDate ? (
                    <div className="mt-2 text-sm text-red-600">
                      Due {new Date(item.dueDate).toLocaleDateString()}
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent open work</h2>
            <span className="text-sm text-neutral-500">
              {topOpenItems.length} item{topOpenItems.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {loading ? (
              <div className="text-sm text-neutral-500">Loading work items...</div>
            ) : topOpenItems.length === 0 ? (
              <div className="rounded-xl border border-dashed p-4 text-sm text-neutral-500">
                No open work items.
              </div>
            ) : (
              topOpenItems.map((item) => {
                const overdue =
                  item.dueDate &&
                  new Date(item.dueDate) < new Date() &&
                  item.status !== "DONE"

                return (
                  <div key={item.id} className="rounded-xl border p-4">
                    <div className="font-medium">{item.title}</div>
                    <div className="mt-1 text-sm text-neutral-600">
                      {item.client?.name || "No client"} • {item.status} • {item.priority}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      {item.dueDate ? (
                        <span className="rounded-full border px-2 py-1">
                          Due {new Date(item.dueDate).toLocaleDateString()}
                        </span>
                      ) : null}
                      {overdue ? (
                        <span className="rounded-full border px-2 py-1 text-red-600">
                          Overdue
                        </span>
                      ) : null}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
