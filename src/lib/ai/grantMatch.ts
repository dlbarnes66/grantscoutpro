import OpenAI from "openai";
import type { Grant, UserProfile } from "@prisma/client";
import { checkRateLimit } from "@/lib/rateLimit";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.GRANT_MATCH_MODEL || "gpt-4o-mini";
const GLOBAL_CALLS_PER_MINUTE = Number(process.env.OPENAI_GLOBAL_CALLS_PER_MINUTE ?? 120);

export type GrantMatchResult = {
  score: number;
  rationale: string;
  whatsNeeded: string[];
};

const FALLBACK: GrantMatchResult = {
  score: 0,
  rationale: "Scoring unavailable right now.",
  whatsNeeded: [],
};

/**
 * Scores how well one grant fits an org's profile - a real AI judgment
 * call, not the crude substring-matching in
 * src/lib/grants/match/calculateMatchScore.ts. Also asks for a plain-
 * language "what's needed" checklist, since we don't have the funder's
 * actual application form - this is the AI's best read of typical
 * requirements based on the grant's own posted description/eligibility
 * text, not a guarantee of the real form fields.
 */
export async function scoreGrantMatch(
  profile: Pick<UserProfile, "organizationName" | "mission" | "focusAreas" | "currentProjects" | "state">,
  grant: Pick<
    Grant,
    "title" | "summary" | "agency" | "category" | "eligibleApplicants" | "eligibility" | "amountMin" | "amountMax" | "awardFloor" | "awardCeiling" | "deadline"
  >
): Promise<GrantMatchResult> {
  const rl = await checkRateLimit("openai:global", GLOBAL_CALLS_PER_MINUTE, 60);
  if (!rl.allowed) return FALLBACK;

  const projects = Array.isArray(profile.currentProjects) ? profile.currentProjects : [];

  const profileText = `Organization: ${profile.organizationName || "Unknown"}
Mission: ${profile.mission || "Not provided"}
Focus areas: ${(profile.focusAreas || []).join(", ") || "Not provided"}
State: ${profile.state || "Not provided"}
Current/planned projects:
${projects.length > 0 ? projects.map((p: any) => `- ${p.title}: ${p.description || ""}`).join("\n") : "None on file"}`;

  const grantText = `Title: ${grant.title}
Agency: ${grant.agency || "Unknown"}
Category: ${grant.category || "Unknown"}
Summary: ${grant.summary || "Not provided"}
Eligible applicants: ${grant.eligibleApplicants || "Not specified"}
Eligibility notes: ${grant.eligibility ? JSON.stringify(grant.eligibility) : "Not specified"}
Award range: ${grant.awardFloor ?? grant.amountMin ?? "?"} - ${grant.awardCeiling ?? grant.amountMax ?? "?"}
Deadline: ${grant.deadline ? new Date(grant.deadline).toDateString() : "Not specified"}`;

  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: `You score how well a grant opportunity fits a nonprofit's mission and current projects, for a grant-matching tool. Return JSON: { "score": number (0-100), "rationale": string (1-2 sentences, specific to this org and grant), "whatsNeeded": string[] (a short checklist of what the org will likely need to prepare for this application, based only on the grant's own posted description/eligibility text - things like "proof of 501(c)(3) status", "a program budget", "letters of support" if the text implies them; keep it to what's reasonably inferable, not invented specifics). A score above 75 should mean a genuinely strong, specific fit - not just a shared broad category.`,
        },
        { role: "user", content: `Organization profile:\n${profileText}\n\nGrant:\n${grantText}` },
      ],
    });

    const raw = response.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(raw);

    const score = typeof parsed.score === "number" ? Math.max(0, Math.min(100, Math.round(parsed.score))) : 0;
    const rationale = typeof parsed.rationale === "string" ? parsed.rationale : "";
    const whatsNeeded = Array.isArray(parsed.whatsNeeded) ? parsed.whatsNeeded.filter((s: any) => typeof s === "string") : [];

    return { score, rationale, whatsNeeded };
  } catch (err) {
    console.error("scoreGrantMatch error:", err);
    return FALLBACK;
  }
}
