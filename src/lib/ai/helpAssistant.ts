import OpenAI from "openai";
import { checkRateLimit } from "@/lib/rateLimit";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.HELP_CHAT_MODEL || "gpt-4o-mini";
const GLOBAL_CALLS_PER_MINUTE = Number(process.env.OPENAI_GLOBAL_CALLS_PER_MINUTE ?? 120);

export type ChatMessage = { role: "user" | "assistant"; content: string };

// Known workspace pages the widget can tell us it's mounted on, and a
// short blurb of what a user can actually do there - kept here instead of
// duplicated per-page so the widget component only has to send a key.
const PAGE_GUIDANCE: Record<string, string> = {
  dashboard: "The user is on the workspace dashboard/overview page, which summarizes recent activity, grants, and documents for this workspace.",
  grants: "The user is on the Grants page, where they browse and manually search for grant opportunities (federal, and state/foundation if their plan includes those sources), save grants, and see recommended matches.",
  documents: "The user is on the Documents page, where they create and edit grant application documents, including AI-assisted section generation.",
  negotiation: "The user is on the AI Negotiation Prep page for a specific grant, which generates scope notes, funding-officer talking points, strategy, rebuttal language, and budget notes.",
  crm: "The user is on the CRM page - a funder/donor pipeline (lead -> contacted -> pipeline -> negotiating -> won/lost) with contacts and notes. This is included on the Enterprise plan or purchasable as an add-on on other plans.",
  billing: "The user is on the Billing page, where the workspace owner manages their plan, seats, and add-ons (State grants, Foundation grants, and CRM can each be purchased standalone if not already included in the plan).",
  settings: "The user is on workspace Settings, covering workspace profile, members/roles, and integrations.",
  activity: "The user is on the Activity page, a log of recent actions taken in this workspace.",
  search: "The user is on a grant search page.",
  insights: "The user is on an analytics/insights page showing trends across this workspace's grants.",
  general: "The user has not specified which page they're on.",
};

function buildSystemPrompt(page: string | undefined): string {
  const guidance = (page && PAGE_GUIDANCE[page]) || PAGE_GUIDANCE.general;

  return `You are the in-app help assistant for Grant Scout Pro, a SaaS platform that helps nonprofits find, track, and win grants. You're talking to a logged-in user who is already a customer, inside their workspace.

Your job is to answer "how do I..." and "what is this..." questions about using the product - navigation, features, and workflows. You are NOT a grant-writing assistant and don't have access to this workspace's actual grants, documents, or data; if asked something that requires looking at their specific data, tell them you can't see that, and point them to the right page or feature to check it themselves.

Context: ${guidance}

Key things you can explain: manual grant search and its daily limit (varies by plan), saved grants, the AI document builder and section generator, the AI negotiation prep assistant (scope/officer talking points/strategy/rebuttal/budget, one per grant), the CRM funder/donor pipeline (contacts, notes, deals - included on Enterprise or purchasable as an add-on), workspace members and roles, deadline reminder emails, and billing/add-ons.

Keep answers short and practical - a sentence or two, or a short numbered set of steps if it's a multi-step task. If you don't know something about the product, say so rather than guessing.`;
}

export async function generateHelpReply(
  messages: ChatMessage[],
  page: string | undefined
): Promise<{ reply: string }> {
  const rl = await checkRateLimit("openai:global", GLOBAL_CALLS_PER_MINUTE, 60);
  if (!rl.allowed) {
    return { reply: "AI request volume is unusually high right now. Please try again in a moment." };
  }

  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      temperature: 0.3,
      max_tokens: 400,
      messages: [{ role: "system", content: buildSystemPrompt(page) }, ...messages],
    });

    const reply = response.choices?.[0]?.message?.content?.trim();
    return { reply: reply || "Sorry, I didn't catch that - could you rephrase your question?" };
  } catch (err) {
    console.error("Help chat model error:", err);
    return { reply: "Something went wrong answering that. Please try again in a moment." };
  }
}
