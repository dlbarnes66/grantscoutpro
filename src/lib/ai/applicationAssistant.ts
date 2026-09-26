// The "answer this funder's real application questions" assistant behind
// the /apply route (src/app/api/workspaces/[id]/grants/[grantId]/
// application-assistant/route.ts). Different job from
// proposalPackage.ts's "Build Submission Package with AI": that one
// always writes Grant Scout Pro's own fixed 6-section narrative,
// regardless of what a given funder actually asks. This one takes the
// funder's OWN questions (pasted, or extracted from an uploaded PDF/
// DOCX via extractText.ts) and drafts an answer to each one - the same
// approach Instrumentl Apply uses on direct competitor grant platforms:
// draft here, user reviews/edits, then copies the answers into the
// funder's own web application themselves. This app never submits to a
// funder's site.
//
// Scoped to private/foundation funders only (see the route's
// Grant.source check) - federal/state applications use a rigid
// structured form (SF-424 + attachments) that doesn't fit a free-text
// Q&A drafting flow the way most foundation applications do.
import OpenAI from "openai";
import type { Grant, UserProfile } from "@prisma/client";
import { checkRateLimit } from "@/lib/rateLimit";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.GRANT_MATCH_MODEL || "gpt-4o-mini";
const GLOBAL_CALLS_PER_MINUTE = Number(process.env.OPENAI_GLOBAL_CALLS_PER_MINUTE ?? 120);

// Raw pasted/extracted text can be long (a whole application document) -
// cap what we send the model, same spend-guarding reasoning as every
// other AI source in this app (see searchBeyondProfile.ts).
const MAX_INPUT_CHARS = 16_000;

export interface ApplicationQuestion {
  id: string;
  prompt: string;
  wordLimit: number | null;
  answer: string;
}

export interface DraftApplicationAnswersResult {
  questions: ApplicationQuestion[];
  tokensUsed: number;
}

const EMPTY_RESULT: DraftApplicationAnswersResult = { questions: [], tokensUsed: 0 };

function buildId(index: number): string {
  return `q${index + 1}`;
}

export async function draftApplicationAnswers(
  rawQuestionsText: string,
  profile: Pick<
    UserProfile,
    "organizationName" | "organizationType" | "mission" | "focusAreas" | "currentProjects" | "state" | "populationsServed"
  >,
  grant: Pick<Grant, "title" | "agency" | "summary" | "foundationName" | "foundationMission" | "foundationRestrictions">
): Promise<DraftApplicationAnswersResult> {
  const rl = await checkRateLimit("openai:global", GLOBAL_CALLS_PER_MINUTE, 60);
  if (!rl.allowed) return EMPTY_RESULT;

  const trimmedInput = rawQuestionsText.trim().slice(0, MAX_INPUT_CHARS);
  if (!trimmedInput) return EMPTY_RESULT;

  const projects = Array.isArray(profile.currentProjects) ? profile.currentProjects : [];

  const profileText = `Organization: ${profile.organizationName || "Unknown"}
Organization type: ${profile.organizationType || "Not specified"}
Mission: ${profile.mission || "Not provided"}
Focus areas: ${(profile.focusAreas || []).join(", ") || "Not provided"}
Populations served: ${(profile.populationsServed || []).join(", ") || "Not provided"}
State: ${profile.state || "Not provided"}
Current/planned projects:
${projects.length > 0 ? projects.map((p: any) => `- ${p.title}: ${p.description || ""}`).join("\n") : "None on file"}`;

  const grantText = `Title: ${grant.title}
Funder: ${grant.foundationName || grant.agency || "Unknown"}
Summary: ${grant.summary || "Not provided"}
Funder's mission: ${grant.foundationMission || "Not provided"}
Funder's restrictions: ${grant.foundationRestrictions || "Not provided"}`;

  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: `You are helping an organization respond to a funder's OWN grant application - the raw text a user pasted or extracted from the funder's actual application document, which may include instructions, headers, page/word-limit notes, and boilerplate mixed in with the real questions. Your job has two parts. First, extract ONLY the distinct questions/prompts the applicant must actually answer, in the order they appear - skip section headers with no question, instructions-only text, and boilerplate (eligibility notices, submission deadlines, contact info) that isn't itself a question to answer. If the text states a word or character limit for a question (e.g. "500 words max", "2000 characters"), capture that number in wordLimit; otherwise wordLimit is null. Second, for each real question, draft a strong, specific answer using the organization's profile and this grant's context below - write as the organization, in first person plural ("we"/"our"), grounded only in what's actually in the profile (don't invent programs, numbers, or history the profile doesn't support), and respect any word/character limit you found. If the raw text has no real, answerable questions in it at all, return an empty items array rather than inventing generic ones. Return JSON: { "items": [ { "prompt": string (the question exactly/closely as the funder wrote it), "wordLimit": number|null, "answer": string } ] }.`,
        },
        {
          role: "user",
          content: `Organization profile:\n${profileText}\n\nGrant/funder context:\n${grantText}\n\nFunder's application text (extract questions from this):\n${trimmedInput}`,
        },
      ],
    });

    const raw = response.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(raw);
    const tokensUsed = response.usage?.total_tokens || 0;

    const items = Array.isArray(parsed.items) ? parsed.items : [];

    const questions: ApplicationQuestion[] = items
      .filter((it: any) => typeof it?.prompt === "string" && it.prompt.trim().length > 0)
      .map((it: any, index: number) => ({
        id: buildId(index),
        prompt: it.prompt.trim(),
        wordLimit:
          typeof it.wordLimit === "number" && Number.isFinite(it.wordLimit) && it.wordLimit > 0
            ? Math.round(it.wordLimit)
            : null,
        answer: typeof it.answer === "string" ? it.answer.trim() : "",
      }));

    return { questions, tokensUsed };
  } catch (err) {
    console.error("draftApplicationAnswers error:", err);
    return EMPTY_RESULT;
  }
}
