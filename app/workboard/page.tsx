export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma"
import WorkboardClient from "@/components/workboard/workboard-client"

export default async function WorkboardPage() {
  const items = await prisma.workItem.findMany({
    include: { client: true }
  })

  return <WorkboardClient initialItems={items} />
}
