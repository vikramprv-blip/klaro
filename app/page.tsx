import Link from "next/link";

export default function HomePage() {
  return (
    <main className="p-8 space-y-4">
      <h1 className="text-3xl font-semibold">Klaro</h1>
      <Link className="underline" href="/dashboard">
        Go to Dashboard
      </Link>
    </main>
  );
}
