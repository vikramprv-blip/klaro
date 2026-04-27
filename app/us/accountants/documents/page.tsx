import UploadForm from "@/app/us/components/upload-form"
import DocumentList from "@/app/us/components/document-list"
import DocumentActivity from "@/app/us/components/document-activity"
import ClientPortalLinks from "@/app/us/components/client-portal-links"

export default function USAccountantDocumentsPage() {
  return (
    <main className="min-h-screen p-8">
      <section className="mx-auto max-w-6xl space-y-6">
        <h1 className="text-3xl font-bold">US Accountant Document Vault</h1>
        <UploadForm />
        <DocumentList />
        <ClientPortalLinks />
        <DocumentActivity />
      </section>
    </main>
  )
}
