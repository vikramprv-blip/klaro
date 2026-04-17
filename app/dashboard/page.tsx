import Link from "next/link"
export default function DashboardPage() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#020617", color: "white" }}>
      <aside style={{ width: 240, background: "#0f172a", borderRight: "1px solid #1e293b", padding: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Klaro</h1>
        <nav style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <a href="/dashboard" style={{ color: "white", textDecoration: "none", fontWeight: 700 }}>Dashboard</a>
          <a href="/workboard" style={{ color: "#cbd5e1", textDecoration: "none" }}>Workboard</a>
          <a href="/clients" style={{ color: "#cbd5e1", textDecoration: "none" }}>Clients</a>
          <a href="/cashflow" style={{ color: "#cbd5e1", textDecoration: "none" }}>Cashflow</a>
        </nav>
      </aside>

      <main style={{ flex: 1, padding: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 24 }}>Dashboard</h1>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 16 }}>
          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: 20 }}>
            <div style={{ color: "#94a3b8", fontSize: 14 }}>Tasks today</div>
            <div style={{ fontSize: 28, fontWeight: 700, marginTop: 8 }}>18</div>
          </div>

          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: 20 }}>
            <div style={{ color: "#94a3b8", fontSize: 14 }}>Filings this week</div>
            <div style={{ fontSize: 28, fontWeight: 700, marginTop: 8 }}>42</div>
          </div>

          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: 20 }}>
            <div style={{ color: "#94a3b8", fontSize: 14 }}>Receivables</div>
            <div style={{ fontSize: 28, fontWeight: 700, marginTop: 8 }}>₹320000</div>
          </div>

          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: 20 }}>
            <div style={{ color: "#94a3b8", fontSize: 14 }}>Overdue clients</div>
            <div style={{ fontSize: 28, fontWeight: 700, marginTop: 8 }}>11</div>
          </div>
        </div>
      </main>
    </div>
  );
}
