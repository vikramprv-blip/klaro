import { groq } from "@/lib/groq"

type Followup = {
  title: string
  owner: string | null
  dueDate: string | null
  priority: "LOW" | "MEDIUM" | "HIGH"
  blockers: string | null
}

function extractJsonArray(text: string): Followup[] {
  const match = text.match(/\[[\s\S]*\]/)
  if (!match) return []

  try {
    const parsed = JSON.parse(match[0])
    if (!Array.isArray(parsed)) return []

    return parsed.map((item) => ({
      title: typeof item?.title === "string" ? item.title : "Untitled follow-up",
      owner: typeof item?.owner === "string" ? item.owner : null,
      dueDate: typeof item?.dueDate === "string" ? item.dueDate : null,
      priority:
        item?.priority === "HIGH" || item?.priority === "MEDIUM" || item?.priority === "LOW"
          ? item.priority
          : "MEDIUM",
      blockers: typeof item?.blockers === "string" ? item.blockers : null,
    }))
  } catch {
    return []
  }
}

export async function generateFollowups(input: {
  title: string
  description?: string | null
}): Promise<Followup[]> {
  const prompt = `
You are an operations assistant.

Given a work item, suggest concrete follow-up actions.

Return ONLY a JSON array.
Each item must be:
{
  "title": string,
  "owner": string | null,
  "dueDate": string | null,
  "priority": "LOW" | "MEDIUM" | "HIGH",
  "blockers": string | null
}

Rules:
- Keep actions concise and operational.
- dueDate should be ISO date string if confidently inferable, otherwise null.
- Do not wrap in markdown.

Work item title: ${input.title}
Work item description: ${input.description || ""}
`.trim()

  const res = await groq.chat.completions.create({
    model: "llama3-70b-8192",
    messages: [
      { role: "system", content: "You output only valid JSON." },
      { role: "user", content: prompt }
    ],
    temperature: 0.2,
  })

  const text = res.choices[0]?.message?.content || "[]"

  return extractJsonArray(text)
}
