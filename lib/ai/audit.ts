import { prisma } from "@/lib/prisma";

type AuditInput = {
  userId?: string | null;
  userEmail?: string | null;
  feature: string;
  route?: string | null;
  provider?: string;
  model?: string | null;
  prompt?: string | null;
  response?: string | null;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  estimatedCost?: number;
  status?: "success" | "error";
  error?: string | null;
  metadata?: Record<string, unknown>;
};

export async function logAiAudit(input: AuditInput) {
  try {
    const promptChars = input.prompt?.length ?? 0;
    const responseChars = input.response?.length ?? 0;

    await prisma.$executeRaw`
      INSERT INTO public.ai_audit_events (
        user_id,
        user_email,
        feature,
        route,
        provider,
        model,
        prompt_chars,
        response_chars,
        input_tokens,
        output_tokens,
        total_tokens,
        estimated_cost,
        status,
        error,
        metadata
      )
      VALUES (
        ${input.userId ?? null}::uuid,
        ${input.userEmail ?? null},
        ${input.feature},
        ${input.route ?? null},
        ${input.provider ?? "groq"},
        ${input.model ?? null},
        ${promptChars},
        ${responseChars},
        ${input.inputTokens ?? 0},
        ${input.outputTokens ?? 0},
        ${input.totalTokens ?? ((input.inputTokens ?? 0) + (input.outputTokens ?? 0))},
        ${input.estimatedCost ?? 0},
        ${input.status ?? "success"},
        ${input.error ?? null},
        ${JSON.stringify(input.metadata ?? {})}::jsonb
      )
    `;
  } catch (err) {
    console.error("AI_AUDIT_LOG_FAILED", err);
  }
}
