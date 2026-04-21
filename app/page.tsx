import Link from 'next/link'

const countries = [
  { code: 'IN', flag: '🇮🇳', name: 'India', href: '/india' },
  { code: 'AE', flag: '🇦🇪', name: 'UAE', href: '/uae' },
  { code: 'US', flag: '🇺🇸', name: 'United States', href: '/us' },
  { code: 'EU', flag: '🇪🇺', name: 'European Union', href: '/eu' },
]

export default function Page() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Choose your country
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            Select your region to continue to the correct Klaro experience.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {countries.map((country) => (
            <Link
              key={country.code}
              href={country.href}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="text-5xl">{country.flag}</div>
              <h2 className="mt-5 text-xl font-semibold">{country.name}</h2>
              <div className="mt-6 text-sm font-medium text-slate-900">Continue →</div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
