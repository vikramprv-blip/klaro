import UploadForm from "@/app/us/components/upload-form"

export default function USLawyersDashboardPage() {
  return (
    <main className="min-h-screen p-8">
      <section className="mx-auto max-w-6xl space-y-6">
        <h1 className="text-3xl font-bold">US Lawyer Dashboard</h1>
        <UploadForm />
      </section>
    </main>
  )
}
