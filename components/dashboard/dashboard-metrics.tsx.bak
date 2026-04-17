"use client"

type Metrics = {
  totalOpen: number
  backlog: number
  todo: number
  inProgress: number
  done: number
  highPriority: number
  urgent: number
}

type Props = {
  metrics: Metrics | null
}

function Card({
  label,
  value,
}: {
  label: string
  value: number | string
}) {
  return (
    <div
      style={{
        background: "#0f172a",
        border: "1px solid #1e293b",
        borderRadius: 16,
        padding: 20,
      }}
    >
      <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
    </div>
  )
}

export function DashboardMetrics({ metrics }: Props) {
  if (!metrics) {
    return (
      <div style={{ opacity: 0.7, padding: "12px 0 20px" }}>
        Loading metrics...
      </div>
    )
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        gap: 16,
      }}
    >
      <Card label="Open Items" value={metrics.totalOpen} />
      <Card label="Backlog" value={metrics.backlog} />
      <Card label="Todo" value={metrics.todo} />
      <Card label="In Progress" value={metrics.inProgress} />
      <Card label="Done" value={metrics.done} />
      <Card label="High Priority" value={metrics.highPriority} />
      <Card label="Urgent" value={metrics.urgent} />
    </div>
  )
}
