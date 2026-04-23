import Groq from "groq-sdk";

export function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || !apiKey.trim()) {
    throw new Error("GROQ_API_KEY is missing");
  }

  return new Groq({ apiKey });
}
