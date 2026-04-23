import Link from "next/link";
import { notFound } from "next/navigation";
import { getRegion } from "@/lib/regions/config";

export default async function RegionLandingPage({
  params,
}: {
  params: Promise<{ region: string }>;
}) {
  const { region } = await params;
  const regionConfig = getRegion(region);

  if (!regionConfig) notFound();

  return (
    <main style={{ padding: "40px", maxWidth: 960, margin: "0 auto" }}>
      <div style={{ display: "grid", gap: 16 }}>
        <p style={{ fontSize: 14, opacity: 0.7 }}>Region: {regionConfig.name}</p>
        <h1 style={{ fontSize: 40, fontWeight: 800, margin: 0 }}>{regionConfig.landingTitle}</h1>
        <p style={{ fontSize: 18, lineHeight: 1.6, margin: 0 }}>{regionConfig.landingSubtitle}</p>
        <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
          <Link
            href={`/${regionConfig.slug}/dashboard`}
            style={{
              display: "inline-flex",
              padding: "12px 18px",
              borderRadius: 12,
              border: "1px solid #111827",
              textDecoration: "none",
            }}
          >
            Open Dashboard
          </Link>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              padding: "12px 18px",
              borderRadius: 12,
              border: "1px solid #d1d5db",
              textDecoration: "none",
            }}
          >
            Change Region
          </Link>
        </div>
      </div>
    </main>
  );
}
