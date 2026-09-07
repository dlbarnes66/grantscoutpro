import OpenAI from "openai";
import { checkRateLimit } from "@/lib/rateLimit";
import { prisma } from "@/lib/prisma";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.AUTOEDITOR_MODEL || "gpt-4o-mini";

// Same global spend guard used by the app-wide callUnifiedModel() helper -
// this bypasses that helper (to get structured JSON output instead of free
// text) but shouldn't bypass the safety net that goes with it.
const GLOBAL_CALLS_PER_MINUTE = Number(process.env.OPENAI_GLOBAL_CALLS_PER_MINUTE ?? 120);

export const NEGOTIATION_SECTIONS = ["scope", "officer", "strategy", "rebuttal", "budget"] as const;
export type NegotiationSection = (typeof NEGOTIATION_SECTIONS)[number];

export function isNegotiationSection(value: unknown): value is NegotiationSection {
  return typeof value === "string" && (NEGOTIATION_SECTIONS as readonly string[]).includes(value);
}

/**
 * Calls the model asking for a JSON object back (response_format:
 * json_object), so the caller gets a real parsed object instead of having
 * to scrape JSON out of a free-text completion.
 */
export async function generateNegotiationSection(
  systemPrompt: string,
  userPrompt: string
): Promise<{ parsed: Record<string, unknown> | null; raw: string }> {
  const rl = await checkRateLimit("openai:global", GLOBAL_CALLS_PER_MINUTE, 60);
  if (!rl.allowed) {
    return { parsed: null, raw: "AI request volume is unusually high right now. Please try again in a moment." };
  }

  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      temperature: 0.3,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const raw = response.choices?.[0]?.message?.content || "{}";
    let parsed: Record<string, unknown> | null = null;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = null;
    }

    return { parsed, raw };
  } catch (err) {
    console.error("Negotiation model error:", err);
    return { parsed: null, raw: "The AI request failed. Please try again." };
  }
}

/**
 * Confirms the caller has access to this grant via this workspace before
 * any negotiation content is generated or read. Returns the grant's real
 * workspaceId on success, or null if the grant doesn't exist, doesn't
 * belong to the given workspace, or the user has no access to it.
 */
export async function assertGrantWorkspaceAccess(
  workspaceId: string,
  grantId: string,
  userId: string
): Promise<boolean> {
  const grant = await prisma.grant.findUnique({ where: { id: grantId }, select: { workspaceId: true } });
  if (!grant || grant.workspaceId !== workspaceId) return false;

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: {
      ownerId: true,
      members: { where: { userId, status: "active" }, select: { id: true } },
    },
  });
  if (!workspace) return false;

  return workspace.ownerId === userId || workspace.members.length > 0;
}

/**
 * Builds the shared grant + organization context block every negotiation
 * prompt is grounded in, pulling real data instead of trusting whatever a
 * client sends.
 */
export async function buildNegotiationContext(grantId: string) {
  const grant = await prisma.grant.findUnique({
    where: { id: grantId },
    select: {
      title: true,
      agency: true,
      description: true,
      summary: true,
      amount: true,
      amountMin: true,
      amountMax: true,
      awardFloor: true,
      awardCeiling: true,
      deadline: true,
      eligibility: true,
      foundationName: true,
      foundationMission: true,
      foundationRestrictions: true,
      aiSummary: true,
      workspaceId: true,
    },
  });

  if (!grant) return null;

  const workspace = await prisma.workspace.findUnique({
    where: { id: grant.workspaceId },
    select: { name: true, ownerId: true },
  });

  const orgProfile = workspace
    ? await prisma.userProfile.findUnique({
        where: { userId: workspace.ownerId },
        select: {
          organizationName: true,
          organizationType: true,
          mission: true,
          focusAreas: true,
          populationsServed: true,
          annualBudget: true,
          grantExperience: true,
          pastWins: true,
        },
      })
    : null;

  return { grant, workspaceName: workspace?.name ?? null, orgProfile };
}

// Persists using the existing (previously unused) NegotiationHistory model:
// one row per generation, tagged by section in `notes`. Loading "current
// state" for the UI means taking the newest row per section.
export async function saveNegotiationSection(
  userId: string,
  grantId: string,
  section: NegotiationSection,
  raw: string
) {
  await prisma.negotiationHistory.create({
    data: { userId, grantId, negotiation: raw, notes: `section:${section}` },
  });
}

export async function loadNegotiationPrep(grantId: string) {
  const rows = await prisma.negotiationHistory.findMany({
    where: { grantId, notes: { startsWith: "section:" } },
    orderBy: { createdAt: "desc" },
  });

  const bySection: Partial<Record<NegotiationSection, { raw: string; parsed: any; generatedAt: string }>> = {};

  for (const row of rows) {
    const section = row.notes?.replace("section:", "") as NegotiationSection | undefined;
    if (!section || !isNegotiationSection(section) || bySection[section]) continue;

    let parsed: any = null;
    try {
      parsed = row.negotiation ? JSON.parse(row.negotiation) : null;
    } catch {
      parsed = null;
    }

    bySection[section] = { raw: row.negotiation ?? "", parsed, generatedAt: row.createdAt.toISOString() };
  }

  return bySection;
}
