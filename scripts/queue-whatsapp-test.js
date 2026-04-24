const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const toPhone = process.argv[2];

  if (!toPhone) {
    console.error("Usage: node scripts/queue-whatsapp-test.js 919999999999");
    process.exit(1);
  }

  const row = await prisma.whatsappOutbox.create({
    data: {
      toPhone,
      templateName: process.env.WHATSAPP_TEMPLATE_NAME || "hello_world",
      templateLang: process.env.WHATSAPP_TEMPLATE_LANG || "en_US",
      payload: {
        bodyParams: [],
      },
    },
  });

  console.log("Queued WhatsApp message:", row.id);
}

main().finally(() => prisma.$disconnect());
