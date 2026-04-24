"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Region = {
  code: string;
  name: string;
  slug: string;
  suiteName: string;
};

type Suggestion = {
  code: string;
  name: string;
  slug: string;
  landingPath: string;
} | null;

const REGIONS: Region[] = [
  { code: "in", name: "India", slug: "in", suiteName: "Klaro India" },
  { code: "us", name: "United States", slug: "us", suiteName: "Klaro United States" },
  { code: "uk", name: "United Kingdom", slug: "uk", suiteName: "Klaro United Kingdom" },
  { code: "eu", name: "European Union", slug: "eu", suiteName: "Klaro European Union" },
  { code: "ae", name: "UAE", slug: "ae", suiteName: "Klaro UAE" },
  { code: "asia", name: "Asia", slug: "asia", suiteName: "Klaro Asia" },
];

export default function HomePage() {
  const [suggestedRegion, setSuggestedRegion] = useState<Suggestion>(null);

  useEffect(() => {
    let active = true;

    fetch("/api/region/suggest", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        setSuggestedRegion(data?.suggestedRegion ?? null);
      })
      .catch(() => {
        if (!active) return;
        setSuggestedRegion(null);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <main style={{ padding: "40px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "grid", gap: 24 }}>
        <div>
          <p style={{ fontSize: 14, opacity: 0.7 }}>klaro.services</p>
          <h1 style={{ fontSize: 40, fontWeight: 800, margin: "8px 0 0 0" }}>Select your region</h1>
        </div>

        {suggestedRegion ? (
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 16,
              padding: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Suggested region</div>
              <div style={{ opacity: 0.8 }}>You appear to be in {suggestedRegion.name}. Continue to the local region page?</div>
            </div>
            <Link
              href={suggestedRegion.landingPath}
              style={{
                display: "inline-flex",
                padding: "12px 18px",
                borderRadius: 12,
                border: "1px solid #111827",
                textDecoration: "none",
              }}
            >
              Go to {suggestedRegion.name}
            </Link>
          </div>
        ) : null}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          {REGIONS.map((region) => (
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
