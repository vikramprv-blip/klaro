import Link from "next/link";
import { getAllRegions } from "@/lib/regions/config";

export default function HomePage() {
  const regions = getAllRegions();

  return (
    <main style={{ padding: "40px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "grid", gap: 24 }}>
        <div>
          <p style={{ fontSize: 14, opacity: 0.7 }}>klaro.services</p>
          <h1 style={{ fontSize: 40, fontWeight: 800, margin: "8px 0 0 0" }}>Select your region</h1>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          {regions.map((region) => (
            <Link
              key={region.code}
              href={`/${region.slug}`}
              style={{
                display: "grid",
                gap: 8,
                padding: 20,
                border: "1px solid #e5e7eb",
                borderRadius: 16,
                textDecoration: "none",
              }}
            >
              <strong style={{ fontSize: 18 }}>{region.name}</strong>
              <span style={{ opacity: 0.75 }}>{region.suiteName}</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
