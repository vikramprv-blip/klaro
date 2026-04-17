const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const [admin, staff1, staff2] = await Promise.all([
    prisma.user.upsert({
      where: { email: "admin@klaro.test" },
      update: {},
      create: {
        name: "Admin",
        email: "admin@klaro.test",
        role: "ADMIN",
      },
    }),
    prisma.user.upsert({
      where: { email: "riya@klaro.test" },
      update: {},
      create: {
        name: "Riya",
        email: "riya@klaro.test",
        role: "STAFF",
      },
    }),
    prisma.user.upsert({
      where: { email: "arjun@klaro.test" },
      update: {},
      create: {
        name: "Arjun",
        email: "arjun@klaro.test",
        role: "REVIEWER",
      },
    }),
  ]);

  const client = await prisma.client.upsert({
    where: { code: "ACME001" },
    update: {},
    create: {
      name: "Acme Pvt Ltd",
      code: "ACME001",
      email: "finance@acme.test",
      gstin: "29ABCDE1234F1Z5",
    },
  });

  const existing = await prisma.workItem.findFirst({
    where: {
      title: "GST Return - March 2026",
      clientId: client.id,
    },
  });

  if (!existing) {
    await prisma.workItem.create({
      data: {
        title: "GST Return - March 2026",
        filingType: "GST Return",
        periodLabel: "Mar 2026",
        dueDate: new Date(),
        clientId: client.id,
        createdById: admin.id,
        priority: "HIGH",
      status: "PENDING",
        assignments: {
          create: [
            {
              userId: staff1.id,
              role: "OWNER",
            },
            {
              userId: staff2.id,
              role: "REVIEWER",
            },
          ],
        },
        documents: {
          create: [
            { name: "Sales Register", docType: "SALES_REGISTER" },
            { name: "Purchase Register", docType: "PURCHASE_REGISTER" },
            { name: "Bank Statement", docType: "BANK_STATEMENT" },
          ],
        },
      },
    });
  }

  console.log("Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
