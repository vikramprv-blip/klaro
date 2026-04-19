import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  let client = await prisma.client.findFirst({
    where: { code: "ACME001" },
  });

  if (!client) {
    client = await prisma.client.create({
      data: {
        name: "Acme Pvt Ltd",
        code: "ACME001",
        email: "finance@acme.test",
        gstin: "29ABCDE1234F1Z5",
      },
    });
  }

  const workItem = await prisma.workItem.create({
    data: {
      title: "GST Return - March 2026",
      description: "Prepare and file GST return for March 2026",
      status: "PENDING",
      priority: "HIGH",
      dueDate: new Date(),
      clientId: client.id,
    },
  });

  const invoice = await prisma.invoice.create({
    data: {
      number: "INV-2026-001",
      amount: 5000,
      status: "DRAFT",
      dueDate: new Date(),
      clientId: client.id,
    },
  });

  let serviceTemplate = await prisma.serviceTemplate.findFirst({
    where: { code: "GST-MONTHLY" },
  });

  if (!serviceTemplate) {
    serviceTemplate = await prisma.serviceTemplate.create({
      data: {
        name: "GST Monthly Filing",
        code: "GST-MONTHLY",
        description: "Monthly GST return filing template",
        department: "Compliance",
        frequency: "MONTHLY",
        dueDayOfMonth: 11,
        isActive: true,
      },
    });
  }

  console.log({ client, workItem, invoice, serviceTemplate });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
