const clientName = process.argv[2] || "Client";
const matterTitle = process.argv[3] || "Matter";
const certificateLink = process.argv[4];

if (!certificateLink) {
  console.error("Usage: node whatsapp-certificate-message.js <clientName> <matterTitle> <certificateLink>");
  process.exit(1);
}

const message = `Hello ${clientName},

Please find the Section 65B evidence certificate for ${matterTitle} below:

${certificateLink}

This link is time-limited for security.

Regards,
Klaro Legal Team`;

const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

console.log("WhatsApp share URL:");
console.log(whatsappUrl);
