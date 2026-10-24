import OpenAI from "openai";
import { checkRateLimit } from "@/lib/rateLimit";
import { discoverOrganization } from "@/lib/organization-discovery";
import { prisma } from "@/lib/prisma";
import { trackAiUsage } from "@/lib/ai/packageAiGuard";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.ORG_SCAN_MODEL || "gpt-4o-mini";
const GLOBAL_CALLS_PER_MINUTE = Number(process.env.OPENAI_GLOBAL_CALLS_PER_MINUTE ?? 120);

export type CurrentProject = { title: string; description: string };

/**
 * AI extraction of "what is this org currently doing or planning" from
 * freshly-scraped website markdown - distinct from the heuristic
 * keyword-matching in organization-extractor.ts (used once at onboarding
 * for mission/keywords). This is meant to be re-run on a schedule so
 * newly announced programs show up without the user re-entering anything.
 */
export async function extractCurrentProjects(markdown: string): Promise<CurrentProject[]> {
  if (!markdown || markdown.trim().length === 0) return [];

  const rl = await checkRateLimit("openai:global", GLOBAL_CALLS_PER_MINUTE, 60);
  if (!rl.allowed) return [];

  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: `You read a nonprofit's website content and identify their current or upcoming programs, projects, and initiatives - the concrete things they are doing or plan to do, not their general mission statement. Return JSON: { "projects": [{ "title": string, "description": string }] }. List at most 8. If the content doesn't clearly describe any specific projects, return an empty array rather than guessing.`,
        },
        { role: "user", content: markdown.slice(0, 12000) },
      ],
    });
    trackAiUsage(response);

    const raw = response.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(raw);
    const projects = Array.isArray(parsed.projects) ? parsed.projects : [];

    return projects
      .filter((p: any) => p && typeof p.title === "string")
      .slice(0, 8)
      .map((p: any) => ({ title: p.title, description: typeof p.description === "string" ? p.description : "" }));
  } catch (err) {
    console.error("extractCurrentProjects error:", err);
    return [];
  }
}

/**
 * Re-scrapes a workspace owner's website (same Firecrawl pipeline as
 * onboarding) and refreshes UserProfile.currentProjects/lastScannedAt.
 * Returns the refreshed profile fields, or null if there's no website on
 * file to scan.
 */
export async function rescanOrganizationWebsite(userId: string): Promise<{
  currentProjects: CurrentProject[];
  focusAreas: string[];
} | null> {
  const profile = await prisma.userProfile.findUnique({ where: { userId } });
  if (!profile?.website) return null;

  const discovered = await discoverOrganization(profile.website);

  // Additional websites the organization listed (capped at 4 when saved).
  // Their content is appended so projects described only on a program site
  // are still picked up; one that fails to load is simply skipped.
  const extraSites = (profile.websites || []).slice(0, 4);
  const extraMarkdown: string[] = [];
  const extraKeywords: string[] = [];
  const extras = await Promise.allSettled(extraSites.map((site) => discoverOrganization(site)));
  for (const r of extras) {
    if (r.status === "fulfilled") {
      extraMarkdown.push(r.value.rawMarkdown.slice(0, 6000));
      extraKeywords.push(...(r.value.keywords || []));
    }
  }
  const currentProjects = await extractCurrentProjects([discovered.rawMarkdown.slice(0, 12000), ...extraMarkdown].join("\n\n"));
  const mergedKeywords = Array.from(new Set([...discovered.keywords, ...extraKeywords]));

  await prisma.userProfile.update({
    where: { userId },
    data: {
      currentProjects,
      lastScannedAt: new Date(),
      // Keep focusAreas/mission fresh too, same fields the onboarding
      // scrape already writes to.
      focusAreas: mergedKeywords.length > 0 ? mergedKeywords : profile.focusAreas,
      mission: discovered.mission || profile.mission,
    },
  });

  return { currentProjects, focusAreas: mergedKeywords };
}
