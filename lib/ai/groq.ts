import { logAiAudit } from "@/lib/ai/audit";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

type GroqMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type GroqOptions = {
  feature?: string;
  route?: string;
  userId?: string | null;
  userEmail?: string | null;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  metadata?: Record<string, unknown>;
};

export async function groqChat(messages: GroqMessage[], options: GroqOptions = {}) {
  const model = options.model || "llama-3.1-8b-instant";
  const prompt = messages.map((m) => `${m.role}: ${m.content}`).join("\n\n");

  if (!GROQ_API_KEY) {
    await logAiAudit({
      userId: options.userId,
      userEmail: options.userEmail,
      feature: options.feature || "unknown",
      route: options.route,
      provider: "groq",
      model,
      prompt,
      status: "error",
      error: "Missing GROQ_API_KEY",
      metadata: options.metadata,
    });

    throw new Error("Missing GROQ_API_KEY");
  }

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature ?? 0.2,
        max_tokens: options.maxTokens ?? 1200,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      await logAiAudit({
        userId: options.userId,
        userEmail: options.userEmail,
        feature: options.feature || "unknown",
        route: options.route,
        provider: "groq",
        model,
        prompt,
        status: "error",
        error: data?.error?.message || `Groq error ${res.status}`,
        metadata: { ...options.metadata, status: res.status },
      });

      throw new Error(data?.error?.message || `Groq error ${res.status}`);
    }

    const content = data?.choices?.[0]?.message?.content || "";
    const usage = data?.usage || {};

    await logAiAudit({
      userId: options.userId,
      userEmail: options.userEmail,
      feature: options.feature || "unknown",
      route: options.route,
      provider: "groq",
      model,
      prompt,
      response: content,
      inputTokens: usage.prompt_tokens || 0,
      outputTokens: usage.completion_tokens || 0,
      totalTokens: usage.total_tokens || 0,
      estimatedCost: 0,
      status: "success",
      metadata: options.metadata,
    });

    return content;
  } catch (err: any) {
    await logAiAudit({
      userId: options.userId,
      userEmail: options.userEmail,
      feature: options.feature || "unknown",
      route: options.route,
      provider: "groq",
      model,
      prompt,
      status: "error",
      error: err?.message || "Unknown Groq error",
      metadata: options.metadata,
    });

    throw err;
  }
}
