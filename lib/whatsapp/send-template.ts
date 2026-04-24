import twilio from "twilio";

export async function sendWhatsAppTemplate(input: {
  toPhone: string;
  templateName?: string;
  templateLang?: string;
  bodyParams?: string[];
}) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_NUMBER;

  if (!accountSid || !authToken || !from) {
    throw new Error("Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN or TWILIO_WHATSAPP_NUMBER");
  }

  const client = twilio(accountSid, authToken);

  const body =
    input.bodyParams && input.bodyParams.length
      ? input.bodyParams.join("\n")
      : "Hello from Klaro";

  return client.messages.create({
    from,
    to: `whatsapp:+${input.toPhone.replace(/[^\d]/g, "")}`,
    body,
  });
}
