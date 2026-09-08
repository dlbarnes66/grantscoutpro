// lib/grants/state/fetchStateGrants.ts
//
// There is no grants.gov equivalent for states - each state runs its own
// site, in its own format, and most "aggregator" results you find by
// searching are paid commercial products (Instrumentl, GrantWatch,
// GrantExec, etc.), not something we can hit programmatically for free.
// So instead of one generic integration, this is a small, growing list of
// real state agency pages we scrape directly with Firecrawl and read with
// AI - starting with the two states that actually matter right now
// (Alabama, where VCG is based, and North Carolina). Add more states by
// adding more entries to STATE_GRANT_SOURCES below; nothing else needs to
// change.
import { getFirecrawl } from "@/lib/firecrawl";
import OpenAI from "openai";
import { checkRateLimit } from "@/lib/rateLimit";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.STATE_GRANT_SCAN_MODEL || "gpt-4o-mini";
const GLOBAL_CALLS_PER_MINUTE = Number(process.env.OPENAI_GLOBAL_CALLS_PER_MINUTE ?? 120);

export interface StateGrantRaw {
  title: string;
  summary?: string | null;
  agency?: string | null;
  category?: string | null;
  deadline?: string | null;
  minAward?: number | null;
  maxAward?: number | null;
  eligibility?: string | null;
  url?: string | null;
  state: string;
}

type StateSource = { state: string; label: string; url: string };

// Each entry is one real page for that state's own grant-making agency.
// These are deliberately specific (a housing agency, an economic/community
// affairs department) rather than a generic search, because there is no
// single "all NC grants" or "all AL grants" page to point at.
export const STATE_GRANT_SOURCES: StateSource[] = [
  {
    state: "AL",
    label: "Alabama ADECA state-funded programs",
    url: "https://adeca.alabama.gov/state-funded-programs/",
  },
  {
    state: "NC",
    label: "NC Office of State Budget and Management - administered grants",
    url: "https://www.osbm.nc.gov/stewardship-services/directed-grants/osbm-administered-grants",
  },
];

async function extractGrantsFromMarkdown(markdown: string, source: StateSource): Promise<StateGrantRaw[]> {
  if (!markdown || markdown.trim().length === 0) return [];

  const rl = await checkRateLimit("openai:global", GLOBAL_CALLS_PER_MINUTE, 60);
  if (!rl.allowed) return [];

  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      temperature: 0.1,
      messages: [
        {
          role: "system",
          content: `You read a state government agency's web page and extract any actual grant or funding programs it describes - things an outside organization (a nonprofit, local government, or business) could apply to receive money from. Ignore navigation links, unrelated news items, and programs that are clearly internal-only. For each program found, return: title, summary (1-2 sentences), category (a short label, e.g. "Housing", "Economic Development"), deadline (an ISO date if one is explicitly stated, otherwise null - do not guess), minAward and maxAward (numbers if stated, otherwise null), eligibility (who can apply, 1 sentence, otherwise null), url (a specific link for that program if the page has one, otherwise null). Return JSON: { "programs": [...] }. If the page describes no real grant programs, return an empty array - do not invent one.`,
        },
        { role: "user", content: `Source: ${source.label} (${source.url})\n\n${markdown.slice(0, 15000)}` },
      ],
    });

    const raw = response.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(raw);
    const programs = Array.isArray(parsed.programs) ? parsed.programs : [];

    return programs
      .filter((p: any) => p && typeof p.title === "string" && p.title.trim().length > 0)
      .map((p: any) => ({
        title: p.title,
        summary: typeof p.summary === "string" ? p.summary : null,
        agency: source.label,
        category: typeof p.category === "string" ? p.category : null,
        deadline: typeof p.deadline === "string" ? p.deadline : null,
        minAward: typeof p.minAward === "number" ? p.minAward : null,
        maxAward: typeof p.maxAward === "number" ? p.maxAward : null,
        eligibility: typeof p.eligibility === "string" ? p.eligibility : null,
        url:
          typeof p.url === "string"
            ? p.url
            : `${source.url}#${p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60)}`,
        state: source.state,
      }));
  } catch (err) {
    console.error(`State grant extraction failed for ${source.label}:`, err);
    return [];
  }
}

/**
 * Scrapes and extracts real grant listings for one US state. Returns []
 * (not an error) for any state we don't have a configured source for yet -
 * callers should treat that as "nothing to ingest," not a failure.
 */
export async function fetchStateGrants(stateCode: string | null | undefined): Promise<StateGrantRaw[]> {
  if (!stateCode) return [];
  const sources = STATE_GRANT_SOURCES.filter((s) => s.state === stateCode.toUpperCase());
  if (sources.length === 0) return [];

  const firecrawl = await getFirecrawl();
  const results: StateGrantRaw[] = [];

  for (const source of sources) {
    try {
      const scrapeResult: any = await firecrawl.v1.scrapeUrl(source.url, { formats: ["markdown"] });
      const markdown: string = scrapeResult?.data?.markdown ?? scrapeResult?.markdown ?? "";
      const extracted = await extractGrantsFromMarkdown(markdown, source);
      results.push(...extracted);
    } catch (err) {
      console.error(`Failed to scrape state grant source ${source.url}:`, err);
    }
  }

  return results;
}
