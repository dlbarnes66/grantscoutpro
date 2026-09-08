import OpenAI from "openai";
import type { Grant, UserProfile } from "@prisma/client";
import { checkRateLimit } from "@/lib/rateLimit";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.PROPOSAL_PACKAGE_MODEL || "gpt-4o-mini";
const GLOBAL_CALLS_PER_MINUTE = Number(process.env.OPENAI_GLOBAL_CALLS_PER_MINUTE ?? 120);

export type ProposalSection = { title: string; content: string };

const STANDARD_SECTIONS = [
  "Statement of Need",
  "Goals & Objectives",
  "Program Description / Methodology",
  "Evaluation Plan",
  "Organizational Background",
  "Budget Narrative",
];

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
  grant: Pick<Grant, "title" | "summary" | "agency" | "eligibility" | "eligibleApplicants">,
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
          content: `You write a first-draft grant proposal narrative for a nonprofit, organized into standard sections: ${STANDARD_SECTIONS.join(", ")}. Return JSON: { "sections": [{ "title": string, "content": string }] } covering all of those sections in that order. Write specifically about the organization's real mission and current projects given below, connected to this specific grant - not generic boilerplate. Each section should be a few solid paragraphs. This is an editable first draft, not a final submission.`,
        },
        {
          role: "user",
          content: `Grant: ${grant.title} (${grant.agency || "funder not specified"})\n${grant.summary || ""}\nEligible applicants: ${grant.eligibleApplicants || "not specified"}\nWhy this is a good fit: ${matchRationale || "not scored yet"}\n\nOrganization: ${profile.organizationName || "Unknown"}\nMission: ${profile.mission || "Not provided"}\nFocus areas: ${(profile.focusAreas || []).join(", ") || "Not provided"}\nCurrent/planned projects:\n${projects.map((p: any) => `- ${p.title}: ${p.description || ""}`).join("\n") || "None on file"}`,
        },
      ],
    });

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
