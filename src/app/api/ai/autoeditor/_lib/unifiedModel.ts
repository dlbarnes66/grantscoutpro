import OpenAI from "openai";
import { checkRateLimit } from "@/lib/rateLimit";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const DEFAULT_MODEL = process.env.AUTOEDITOR_MODEL || "gpt-4o-mini";

// Blanket, app-wide safety net: every AI panel in this codebase (200+
// call sites) funnels through this one function, but most of those
// call sites have no idea what workspace/user is asking and can't be
// individually rate-limited without a much larger refactor. This caps
// total OpenAI spend across the whole app regardless of caller, so a
// runaway loop, a scraped/looping client, or a bug in any one panel
// can't quietly run up an unbounded bill. Per-workspace limits belong
// at the call site (see src/lib/ai/guardAIRequest.ts) where the
// workspace is actually known -- this is the last line of defense,
// not a replacement for that.
const GLOBAL_CALLS_PER_MINUTE = Number(process.env.OPENAI_GLOBAL_CALLS_PER_MINUTE ?? 120);

export async function callUnifiedModel(prompt: string, model?: string) {
  const rl = await checkRateLimit("openai:global", GLOBAL_CALLS_PER_MINUTE, 60);
  if (!rl.allowed) {
    console.error("Unified Model Error: global OpenAI call rate limit hit");
    return "[ERROR: AI request volume is unusually high right now. Please try again in a moment.]";
  }

  try {
    const response = await client.chat.completions.create({
      model: model || DEFAULT_MODEL,
      messages: [
        {
          role: "system",
          content: "You are a senior grant writer and editing engine.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
    });

    const output = response.choices?.[0]?.message?.content || "";
    return output;
  } catch (error) {
    console.error("Unified Model Error:", error);
    return "[ERROR: Unified model failed to generate output]";
  }
}
