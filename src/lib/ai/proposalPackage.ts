import OpenAI from "openai";
import type { Grant, UserProfile } from "@prisma/client";
import { checkRateLimit } from "@/lib/rateLimit";
import { trackAiUsage } from "@/lib/ai/packageAiGuard";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.PROPOSAL_PACKAGE_MODEL || "gpt-4o-mini";
const GLOBAL_CALLS_PER_MINUTE = Number(process.env.OPENAI_GLOBAL_CALLS_PER_MINUTE ?? 120);

export type ProposalSection = { title: string; content: string };

export const STANDARD_SECTIONS = [
  "Executive Summary",
  "Statement of Need",
  "Goals & Objectives",
  "Program Description / Methodology",
  "Work Plan & Timeline",
  "Staffing, Partners & Responsibilities",
  "Evaluation Plan",
  "Sustainability Plan",
  "Organizational Background",
  "Budget Narrative",
];

// The model writes every standard section except three that are built
// another way: the Work Plan & Timeline is a structured template
// (workPlan.ts), and the Executive Summary and Sustainability Plan are
// generated afterwards from the finished draft (packageSections.ts).
export const AI_SECTIONS = STANDARD_SECTIONS.filter(
  (t) => t !== "Executive Summary" && t !== "Work Plan & Timeline" && t !== "Sustainability Plan"
);

const FALLBACK: ProposalSection[] = [];

/**
 * Generates a full first-draft proposal narrative in one pass, across
 * the standard grant-application sections - the "AI takes control"
 * step of the submission-package flow. This is a starting draft the
 * user reviews and edits before finalizing, not a finished application;
 * it doesn't know a given funder's exact required sections or page
 * limits, only what's inferable from the grant's own posted text.
 */
export async function generateProposalSections(
  grant: Pick<Grant, "title" | "summary" | "agency" | "eligibility" | "eligibleApplicants"> &
    Partial<Pick<Grant, "description" | "awardFloor" | "awardCeiling" | "deadline">>,
  profile: Pick<UserProfile, "organizationName" | "mission" | "currentProjects" | "focusAreas">,
  matchRationale: string
): Promise<ProposalSection[]> {
  const rl = await checkRateLimit("openai:global", GLOBAL_CALLS_PER_MINUTE, 60);
  if (!rl.allowed) return FALLBACK;

  const projects = Array.isArray(profile.currentProjects) ? profile.currentProjects : [];

  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content: `You write a first-draft grant proposal narrative for a nonprofit, organized into exactly these sections: ${AI_SECTIONS.join(", ")}. Return JSON: { "sections": [{ "title": string, "content": string }] } covering all of those sections in that order and no others. Write specifically about the organization's real mission and current projects given below, connected to this specific grant - not generic boilerplate. Each section should be a few solid paragraphs. Section guidance: Statement of Need = the problem, who is affected, gaps in existing services, evidence; Goals & Objectives = goals plus measurable objectives; Staffing, Partners & Responsibilities = roles needed and who is responsible for what; Evaluation Plan = performance indicators with targets, data collection methods, reporting schedule, short- and long-term outcomes; Budget Narrative = a plain-English explanation of the costs. HONESTY RULES: use only facts present in the organization profile and grant context below. Never invent statistics, named people, partner organizations, prior award amounts or dates. Where a specific fact is needed but not provided (a statistic, a staff name, a partner, a target number), write a clearly marked placeholder in square brackets such as [add local statistic and source] so the applicant fills it in. This is an editable first draft, not a final submission.`,
        },
        {
          role: "user",
          content: `Grant: ${grant.title} (${grant.agency || "funder not specified"})\n${grant.summary || ""}\nEligible applicants: ${grant.eligibleApplicants || "not specified"}\nAward range: ${grant.awardFloor ?? "?"} to ${grant.awardCeiling ?? "?"}\nDeadline: ${grant.deadline ? new Date(grant.deadline).toISOString().slice(0, 10) : "not stated"}\nFunder's posted description: ${(grant.description || "").slice(0, 3000) || "not provided"}\nWhy this is a good fit: ${matchRationale || "not scored yet"}\n\nOrganization: ${profile.organizationName || "Unknown"}\nMission: ${profile.mission || "Not provided"}\nFocus areas: ${(profile.focusAreas || []).join(", ") || "Not provided"}\nCurrent/planned projects:\n${projects.map((p: any) => `- ${p.title}: ${p.description || ""}`).join("\n") || "None on file"}`,
        },
      ],
    });
    trackAiUsage(response);

    const raw = response.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(raw);

    const sections = Array.isArray(parsed.sections)
      ? parsed.sections
          .filter((s: any) => s && typeof s.title === "string" && typeof s.content === "string")
          .map((s: any) => ({ title: s.title, content: s.content }))
      : [];

    return sections.length > 0 ? sections : FALLBACK;
  } catch (err) {
    console.error("generateProposalSections error:", err);
    return FALLBACK;
  }
}
