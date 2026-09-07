// src/lib/ai/groq.ts
import { checkRateLimit } from "@/lib/rateLimit";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// Same blanket safety net as callUnifiedModel (src/lib/ai/...unifiedModel.ts)
// -- app-wide cap so a runaway caller can't quietly run up spend here either.
const GLOBAL_CALLS_PER_MINUTE = Number(process.env.GROQ_GLOBAL_CALLS_PER_MINUTE ?? 120);

export async function groqChat({
  system,
  user,
  model = "llama-3.1-70b-versatile",
}: {
  system: string;
  user: string;
  model?: string;
}) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not set");

  const rl = await checkRateLimit("groq:global", GLOBAL_CALLS_PER_MINUTE, 60);
  if (!rl.allowed) {
    throw new Error("AI request volume is unusually high right now. Please try again in a moment.");
  }

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Groq error: ${res.status} ${text}`);
  }

  const json = await res.json();
  return json.choices?.[0]?.message?.content ?? "";
}
