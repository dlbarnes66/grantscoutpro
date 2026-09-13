import OpenAI from "openai";
import { checkRateLimit } from "@/lib/rateLimit";
import { checkAiTokenBudget, recordAiTokenUsage } from "@/lib/ai/aiUsage";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const DEFAULT_MODEL = process.env.AUTOEDITOR_MODEL || "gpt-4o-mini";

// Blanket, app-wide safety net: every AI panel in this codebase (200+
// call sites) funnels through this one function. Most of those call
// sites don't pass a workspaceId (a much larger refactor to thread
// through all of them), so this global rate limit stays as the last
// line of defense against a runaway loop or a scraped/looping client
// regardless of caller.
//
// Callers that DO know their workspaceId (currently the ~55
// per-document AI panels under
// src/app/api/workspaces/[id]/documents/[documentId]/ai/*) pass it as
// the third argument, which enforces a real per-plan monthly OpenAI
// token budget (see src/lib/ai/aiUsage.ts) - this is the actual cost
// cap; the call-count limit above is not a substitute for it, since a
// handful of huge prompts can cost far more than many small ones.
const GLOBAL_CALLS_PER_MINUTE = Number(process.env.OPENAI_GLOBAL_CALLS_PER_MINUTE ?? 120);

export async function callUnifiedModel(prompt: string, model?: string, workspaceId?: string) {
  const rl = await checkRateLimit("openai:global", GLOBAL_CALLS_PER_MINUTE, 60);
  if (!rl.allowed) {
    console.error("Unified Model Error: global OpenAI call rate limit hit");
    return "[ERROR: AI request volume is unusually high right now. Please try again in a moment.]";
  }

  if (workspaceId) {
    const budget = await checkAiTokenBudget(workspaceId).catch((err) => {
      console.error("AI token budget check failed:", err);
      return null;
    });
    if (budget && !budget.allowed) {
      const resetDate = budget.nextResetAt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      return `[ERROR: This workspace has used its monthly AI budget (${budget.limit.toLocaleString()} tokens). It resets around ${resetDate}, or upgrade your plan for a higher limit.]`;
    }
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

    if (workspaceId) {
      void recordAiTokenUsage(workspaceId, response.usage?.total_tokens ?? 0);
    }

    return output;
  } catch (error) {
    console.error("Unified Model Error:", error);
    return "[ERROR: Unified model failed to generate output]";
  }
}
