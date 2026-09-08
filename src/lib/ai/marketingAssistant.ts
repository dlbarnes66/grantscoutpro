import OpenAI from "openai";
import { checkRateLimit } from "@/lib/rateLimit";
import { PLANS, getSeatLimitLabel, getManualSearchLimitLabel } from "@/lib/plans";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.MARKETING_CHAT_MODEL || "gpt-4o-mini";
const GLOBAL_CALLS_PER_MINUTE = Number(process.env.OPENAI_GLOBAL_CALLS_PER_MINUTE ?? 120);

export type ChatMessage = { role: "user" | "assistant"; content: string };

// Built from the same PLANS config that drives checkout and enforcement
// (src/lib/plans.ts), so the bot's pricing/feature answers can't drift out
// of sync with what the app actually sells - only the surrounding
// marketing language below is hand-written.
function describePlans(): string {
  return Object.values(PLANS)
    .map((plan) => {
      const price = plan.monthlyPrice === null ? "Custom pricing (contact sales)" : `$${plan.monthlyPrice}/month`;
      const sources = [
        "Federal grants",
        plan.access.state && "State grants",
        plan.access.foundation && "Private foundation grants",
      ]
        .filter(Boolean)
        .join(", ");
      const crm = plan.access.crm
        ? "Includes the funder/donor CRM"
        : "CRM available as an add-on";

      return `- ${plan.name}: ${price}. ${getSeatLimitLabel(plan)}. ${getManualSearchLimitLabel(plan)}. Grant sources: ${sources}. ${crm}.`;
    })
    .join("\n");
}

const SYSTEM_PROMPT = `You are the assistant on the Grant Scout Pro marketing website, answering questions from visitors who have not signed up yet (they are not logged in).

Grant Scout Pro is a SaaS platform that helps nonprofits find, track, and win grants. Core features:
- Grant search across federal, state, and private foundation sources (which sources are included depends on plan - see below)
- AI-assisted grant matching and eligibility/competitiveness scoring
- An AI-assisted document builder for writing grant application sections
- A funder/donor CRM: a pipeline (lead -> contacted -> pipeline -> negotiating -> won/lost) with contacts, notes, and deal tracking
- An AI negotiation prep assistant that generates scope notes, funding-officer talking points, strategy, rebuttal language, and budget notes for a specific grant
- Team workspaces with role-based member management, deadline reminder emails, and activity tracking

Current plans:
${describePlans()}

Rules:
- Only answer questions about Grant Scout Pro - its features, plans, pricing, and how it works in general terms.
- Never invent a price, feature, or limit that isn't listed above. If you don't know something, say so plainly and suggest the visitor sign up or contact the team, rather than guessing.
- You cannot see anyone's account, workspace, or billing details - if someone asks about their own account, tell them to sign in, or contact support if they need help with something account-specific.
- Keep answers concise and friendly. This is a marketing chat widget, not a support ticket system.
- Don't discuss unrelated topics, competitors, or anything outside Grant Scout Pro.`;

export async function generateMarketingReply(
  messages: ChatMessage[]
): Promise<{ reply: string; rateLimited?: boolean }> {
  const rl = await checkRateLimit("openai:global", GLOBAL_CALLS_PER_MINUTE, 60);
  if (!rl.allowed) {
    return {
      reply: "We're getting a lot of questions right now - please try again in a moment.",
      rateLimited: true,
    };
  }

  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      temperature: 0.4,
      max_tokens: 400,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
    });

    const reply = response.choices?.[0]?.message?.content?.trim();
    return { reply: reply || "Sorry, I didn't catch that - could you rephrase your question?" };
  } catch (err) {
    console.error("Marketing chat model error:", err);
    return { reply: "Something went wrong answering that. Please try again in a moment." };
  }
}
