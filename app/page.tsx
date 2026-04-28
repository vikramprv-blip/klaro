import Link from "next/link";

const regions = [
  {
    name: "India",
    code: "IN",
    status: "Live",
    href: "/in",
    description: "Practice OS for CAs, lawyers, compliance teams, documents, billing, and workflows.",
  },
  {
    name: "United States",
    code: "US",
    status: "Live",
    href: "/us",
    description: "Secure client document portal for tax, accounting, and advisory firms.",
  },
  {
    name: "United Kingdom",
    code: "UK",
    status: "Coming soon",
    href: "#",
    description: "Localized workflows for UK professional services firms.",
  },
  {
    name: "United Arab Emirates",
    code: "UAE",
    status: "Coming soon",
    href: "#",
    description: "Document and workflow tools for UAE firms.",
  },
  {
    name: "Denmark",
    code: "DK",
    status: "Coming soon",
    href: "#",
    description: "Localized document workflows for Danish firms.",
  },
  {
    name: "Norway",
    code: "NO",
    status: "Coming soon",
    href: "#",
    description: "Localized document workflows for Norwegian firms.",
  },
  {
    name: "Sweden",
    code: "SE",
    status: "Coming soon",
    href: "#",
    description: "Localized document workflows for Swedish firms.",
  },
  {
    name: "Singapore",
    code: "SG",
    status: "Coming soon",
    href: "#",
    description: "Document workflows for Singapore professional firms.",
  },
  {
    name: "Thailand",
    code: "TH",
    status: "Coming soon",
    href: "#",
    description: "Localized document workflows for Thai firms.",
  },
  {
    name: "Vietnam",
    code: "VN",
    status: "Coming soon",
    href: "#",
    description: "Localized document workflows for Vietnamese firms.",
  },
  {
    name: "Japan",
    code: "JP",
    status: "Coming soon",
    href: "#",
    description: "Localized document workflows for Japanese firms.",
  },
];

export default function RegionSelectorPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-blue-300">
            Klaro Global
          </p>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
            Choose your region
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-300">
            Klaro is localized by country so pricing, workflows, compliance language,
            and product modules match your market.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {regions.map((region) => {
            const isLive = region.status === "Live";

            const card = (
              <div
                className={`h-full rounded-2xl border p-6 transition ${
                  isLive
                    ? "border-blue-400/50 bg-white text-slate-950 hover:-translate-y-1 hover:shadow-2xl"
                    : "border-white/10 bg-white/5 text-white opacity-80"
                }`}
              >
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <p className={isLive ? "text-sm text-slate-500" : "text-sm text-slate-400"}>
                      {region.code}
                    </p>
                    <h2 className="text-2xl font-semibold">{region.name}</h2>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      isLive
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {region.status}
                  </span>
                </div>

                <p className={isLive ? "text-sm text-slate-600" : "text-sm text-slate-300"}>
                  {region.description}
                </p>

                <div className="mt-6 text-sm font-semibold">
                  {isLive ? "Enter region →" : "Join waitlist soon"}
                </div>
              </div>
            );

            return isLive ? (
              <Link key={region.code} href={region.href}>
                {card}
              </Link>
            ) : (
              <div key={region.code}>{card}</div>
            );
          })}
        </div>

        <p className="mt-10 text-sm text-slate-400">
          India and United States are live. Additional country editions are being localized.
        </p>
      </div>
    </main>
  );
}
