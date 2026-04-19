import Link from "next/link"
import { getServiceTemplates } from "@/lib/service-templates"
import ServiceTemplateForm from "@/components/service-templates/service-template-form"

export default async function ServiceTemplatesPage() {
  const templates = await getServiceTemplates()

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Service Templates</h1>
          <p className="text-sm text-gray-500">Define recurring CA service types before generating compliance work.</p>
        </div>
        <Link href="/dashboard/live" className="rounded-xl border px-4 py-2">
          Back to Dashboard
        </Link>
      </div>

      <ServiceTemplateForm />

      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        <div className="border-b px-5 py-4 font-semibold">Templates</div>

        {templates.length === 0 ? (
          <div className="px-5 py-6 text-sm text-gray-500">No service templates yet.</div>
        ) : (
          <div className="divide-y">
            {templates.map((template) => (
              <div key={template.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold">{template.name}</div>
                    <div className="text-sm text-gray-500">
                      {(template.code || "—")} • {template.department || "—"} • {template.frequency}
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      Due day: {template.dueDayOfMonth ?? "—"} • Due month: {template.dueMonthOfYear ?? "—"}
                    </div>
                    {template.description ? (
                      <div className="mt-2 text-sm">{template.description}</div>
                    ) : null}
                  </div>
                  <div className="rounded-full border px-3 py-1 text-xs">
                    {template.isActive ? "Active" : "Inactive"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
