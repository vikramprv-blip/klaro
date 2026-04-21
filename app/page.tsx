import Link from 'next/link'

const countries = [
  { code: 'in', flag: '🇮🇳', name: 'India', desc: 'CA Suite, GST, TDS, AI tools' },
  { code: 'ae', flag: '🇦🇪', name: 'UAE', desc: 'UAE region tools' },
  { code: 'us', flag: '🇺🇸', name: 'United States', desc: 'US region tools' },
  { code: 'eu', flag: '🇪🇺', name: 'Europe', desc: 'EU region tools' },
]

export default function CountryPickerPage() {
  return (
    <main className="min-h-[calc(100vh-72px)] bg-white">
      <section className="mx-auto max-w-6xl px-6 py-16 md:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-gray-900 md:text-5xl">
            Choose your country
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Select your region to continue to the correct product experience.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-5 sm:grid-cols-2">
          {countries.map((country) => (
            <Link
              key={country.code}
              href={`/${country.code}`}
              className="group rounded-2xl border border-gray-200 bg-white p-6 transition hover:border-gray-300 hover:shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl leading-none">{country.flag}</div>
                <div>
                  <div className="text-xl font-semibold text-gray-900">{country.name}</div>
                  <div className="mt-2 text-sm text-gray-600">{country.desc}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
