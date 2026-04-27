import { UsBillingCard } from "@/app/us/components/us-billing-card"
import UploadForm from "@/app/us/components/upload-form"
import DocumentList from "@/app/us/components/document-list"
import DocumentActivity from "@/app/us/components/document-activity"
import ClientPortalLinks from "@/app/us/components/client-portal-links"

export default function USLawyerDocumentsPage() {
  return (
    <main className="min-h-screen p-8">
      <section className="mx-auto max-w-6xl space-y-6">
        <h1 className="text-3xl font-bold">US Lawyer Document Vault</h1>
        <UploadForm />
        <UsBillingCard />

      <DocumentList />
        <ClientPortalLinks />
        <DocumentActivity />
      </section>
    </main>
  )
}
