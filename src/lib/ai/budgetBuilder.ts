import OpenAI from "openai";
import type { Grant, UserProfile } from "@prisma/client";
import { checkRateLimit } from "@/lib/rateLimit";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.BUDGET_BUILDER_MODEL || "gpt-4o-mini";
const GLOBAL_CALLS_PER_MINUTE = Number(process.env.OPENAI_GLOBAL_CALLS_PER_MINUTE ?? 120);

export type BudgetLineItem = { category: string; description: string; amount: number };
export type GeneratedBudget = { lineItems: BudgetLineItem[]; total: number; notes: string };

const EMPTY_BUDGET: GeneratedBudget = { lineItems: [], total: 0, notes: "Budget generation unavailable right now." };

/**
 * Replaces the old /api/ai/budget-planner, which was a pure stub
 * (returned "Budget planner endpoint placeholder" and nothing else).
 * Produces a first-draft, editable line-item budget sized to the
 * grant's award range - a starting point for the user to adjust, not a
 * final figure.
 */
export async function generateGrantBudget(
  grant: Pick<Grant, "title" | "summary" | "amountMin" | "amountMax" | "awardFloor" | "awardCeiling">,
  profile: Pick<UserProfile, "organizationName" | "mission" | "currentProjects">
): Promise<GeneratedBudget> {
  const rl = await checkRateLimit("openai:global", GLOBAL_CALLS_PER_MINUTE, 60);
  if (!rl.allowed) return EMPTY_BUDGET;

  const ceiling = grant.awardCeiling ?? grant.amountMax ?? null;
  const floor = grant.awardFloor ?? grant.amountMin ?? null;
  const targetAmount = ceiling ?? floor ?? 25000;

  const projects = Array.isArray(profile.currentProjects) ? profile.currentProjects : [];

  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: `You draft a first-pass grant program budget for a nonprofit. Return JSON: { "lineItems": [{ "category": string, "description": string, "amount": number }], "total": number, "notes": string }. Line items should sum to approximately the target amount given. Use realistic nonprofit budget categories (personnel, program supplies, evaluation, indirect/overhead, etc.) relevant to the grant and organization described. This is a draft for the user to edit, not a final submission - say so briefly in notes.`,
        },
        {
          role: "user",
          content: `Grant: ${grant.title}\n${grant.summary || ""}\nTarget award amount: $${targetAmount}\n\nOrganization: ${profile.organizationName || "Unknown"}\nMission: ${profile.mission || "Not provided"}\nCurrent projects: ${projects.map((p: any) => p.title).join(", ") || "None on file"}`,
        },
      ],
    });

    const raw = response.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(raw);

    const lineItems: BudgetLineItem[] = Array.isArray(parsed.lineItems)
      ? parsed.lineItems
          .filter((i: any) => i && typeof i.category === "string" && typeof i.amount === "number")
          .map((i: any) => ({
            category: i.category,
            description: typeof i.description === "string" ? i.description : "",
            amount: Math.round(i.amount),
          }))
      : [];

    const total = typeof parsed.total === "number" ? Math.round(parsed.total) : lineItems.reduce((s, i) => s + i.amount, 0);
    const notes = typeof parsed.notes === "string" ? parsed.notes : "";

    return { lineItems, total, notes };
  } catch (err) {
    console.error("generateGrantBudget error:", err);
    return EMPTY_BUDGET;
  }
}
