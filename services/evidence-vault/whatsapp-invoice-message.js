const clientName = process.argv[2] || "Client";
const amount = process.argv[3];
const matterTitle = process.argv[4] || "Legal Matter";
const upiLink = process.argv[5];

if (!amount || !upiLink) {
  console.error("Usage: node whatsapp-invoice-message.js <clientName> <amount> <matterTitle> <upiLink>");
  process.exit(1);
}

const message = `Hello ${clientName},

Invoice for ${matterTitle}: ₹${amount}

You can pay securely using this UPI link:
${upiLink}

Regards,
Klaro Legal Team`;

console.log("WhatsApp invoice URL:");
console.log(`https://wa.me/?text=${encodeURIComponent(message)}`);
