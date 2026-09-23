// src/lib/grants/agent/searchBeyondProfile.ts
//
// The "search beyond my profile" agent behind the second button on the
// workspace grants page (for-profit workspaces only - see the route at
// src/app/api/workspaces/[id]/grants/search-agent/route.ts). Unlike
// every other source in src/lib/grants/ (Grants.gov, SBIR.gov, state
// scrapers, ProPublica foundation filings), there is no structured API
// for "minority-owned / veteran-owned / women-owned business grant"
// programs - most of them are private or corporate (Amber Grant,
// Comcast RISE, IFundWomen, and dozens like them), scattered across
// individual funder sites with no shared index. So instead of an
// ingestion pipeline hitting one fixed API, this runs a real web
// search (Firecrawl) per category, then an OpenAI call to read what
// was actually found and pull out real, named programs - nothing
// invented. Every result the model returns is cross-checked against
// the URLs we actually fetched before it's trusted; anything that
// doesn't match a real fetched source is dropped rather than shown to
// the user.
//
// This is meaningfully more expensive and slower (real web search +
// an LLM read of several pages, ~20-50s) than the rest of the grants/
// sources, which is why it's gated separately (WorkspaceBilling.
// agentSearchCount, distinct from manualSearchCount) and only offered
// to for-profit workspaces, per how it's actually being used.

import OpenAI from "openai";
import type { UserProfile } from "@prisma/client";
import { getFirecrawl } from "@/lib/firecrawl";
import { checkRateLimit } from "@/lib/rateLimit";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.GRANT_MATCH_MODEL || "gpt-4o-mini";
const GLOBAL_CALLS_PER_MINUTE = Number(process.env.OPENAI_GLOBAL_CALLS_PER_MINUTE ?? 120);

export const AGENT_SEARCH_CATEGORIES = [
  "for_profit",
  "minority_owned",
  "veteran_owned",
  "women_owned",
] as const;

export type AgentSearchCategory = (typeof AGENT_SEARCH_CATEGORIES)[number];

export const AGENT_CATEGORY_LABELS: Record<AgentSearchCategory, string> = {
  for_profit: "For-Profit Business Grant",
  minority_owned: "Minority-Owned Business Grant",
  veteran_owned: "Veteran-Owned Business Grant",
  women_owned: "Women-Owned Business Grant",
};

// The search phrase appended to the org's own focus/industry terms per
// category. Kept generic on purpose - specific enough to pull real
// funding-program pages, general enough not to over-constrain what's
// a genuinely wide, unindexed part of the web.
const CATEGORY_QUERY_SUFFIX: Record<AgentSearchCategory, string> = {
  for_profit: "small business grant funding program apply 2026",
  minority_owned: "minority-owned business grant funding program apply 2026",
  veteran_owned: "veteran-owned small business grant funding program apply 2026",
  women_owned: "women-owned small business grant funding program apply 2026",
};

const MAX_RESULTS_PER_CATEGORY = 5;
const MAX_CONTENT_CHARS_PER_PAGE = 2500;
const SEARCH_TIMEOUT_MS = 20_000;

export interface AgentGrantResult {
  category: AgentSearchCategory;
  title: string;
  funder: string | null;
  summary: string;
  eligibleApplicants: string | null;
  amountText: string | null;
  deadlineText: string | null;
  url: string;
}

export interface AgentSearchOutcome {
  results: AgentGrantResult[];
  errors: string[];
  tokensUsed: number;
  pagesSearched: number;
}

interface FetchedPage {
  url: string;
  title: string;
  content: string;
}

function sourceUrl(item: any): string | null {
  return item?.url ?? item?.metadata?.sourceURL ?? item?.metadata?.url ?? null;
}

function buildQuery(profile: Pick<UserProfile, "focusAreas" | "mission" | "organizationName" | "state">, category: AgentSearchCategory): string {
  const focus = (profile.focusAreas && profile.focusAreas.length > 0 ? profile.focusAreas.slice(0, 3).join(" ") : null) || profile.mission?.slice(0, 60) || profile.organizationName || "";
  const location = profile.state ? ` in ${profile.state}` : "";
  return `${focus} ${CATEGORY_QUERY_SUFFIX[category]}${location}`.trim();
}

async function searchCategory(
  profile: Pick<UserProfile, "focusAreas" | "mission" | "organizationName" | "state">,
  category: AgentSearchCategory
): Promise<{ pages: FetchedPage[]; error: string | null }> {
  try {
    const firecrawl = await getFirecrawl();
    const query = buildQuery(profile, category);

    const data = await firecrawl.search(query, {
      limit: MAX_RESULTS_PER_CATEGORY,
      scrapeOptions: { formats: ["markdown"] },
      timeout: SEARCH_TIMEOUT_MS,
    });

    const web = Array.isArray(data?.web) ? data.web : [];
    const pages: FetchedPage[] = web
      .map((item: any) => {
        const url = sourceUrl(item);
        if (!url) return null;
        const content = (item.markdown || item.description || "").toString().slice(0, MAX_CONTENT_CHARS_PER_PAGE);
        if (!content) return null;
        return { url, title: item.title || item.metadata?.title || url, content };
      })
      .filter((p: FetchedPage | null): p is FetchedPage => !!p);

    return { pages, error: null };
  } catch (err: any) {
    return { pages: [], error: `${AGENT_CATEGORY_LABELS[category]} search failed: ${err?.message || err}` };
  }
}

// Asks the model to extract real, named funding programs from the
// fetched page text - and only those, never anything it wasn't shown.
// The prompt asks for this; validateAgainstFetchedPages (below) is
// what actually enforces it, by dropping anything whose URL doesn't
// match a page we really fetched.
async function extractFromPages(
  category: AgentSearchCategory,
  pages: FetchedPage[]
): Promise<{ items: AgentGrantResult[]; tokens: number }> {
  if (pages.length === 0) return { items: [], tokens: 0 };

  const rl = await checkRateLimit("openai:global", GLOBAL_CALLS_PER_MINUTE, 60);
  if (!rl.allowed) return { items: [], tokens: 0 };

  const sourceBlock = pages
    .map((p, i) => `SOURCE ${i + 1}\nURL: ${p.url}\nTITLE: ${p.title}\nCONTENT:\n${p.content}`)
    .join("\n\n---\n\n");

  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      temperature: 0.1,
      messages: [
        {
          role: "system",
          content: `You extract real, named grant or funding programs for "${AGENT_CATEGORY_LABELS[category]}" opportunities from web page text a search engine actually returned. Only include a program if the provided text clearly describes it as a real, currently-relevant funding/grant program - never invent, infer, or "fill in" a program that isn't actually described in the text. If a source page is not really about a funding program (e.g. it's a news article, a directory homepage with no specifics, or irrelevant), skip it entirely rather than guessing. For each real program found, use the EXACT URL of the source it came from - never alter or guess a URL. Return JSON: { "items": [ { "title": string, "funder": string|null (the organization offering it), "summary": string (1-2 sentences on what it funds), "eligibleApplicants": string|null (who qualifies, if stated), "amountText": string|null (award amount/range as stated in the text, e.g. "$5,000-$25,000" or "up to $10,000" - do not invent a figure), "deadlineText": string|null (deadline or application cycle as stated, if any), "url": string (must exactly match one of the provided source URLs) } ] }. Return an empty items array if nothing in the provided text is a real, specific program.`,
        },
        { role: "user", content: sourceBlock },
      ],
    });

    const raw = response.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(raw);
    const tokens = response.usage?.total_tokens || 0;

    const items = Array.isArray(parsed.items) ? parsed.items : [];

    const validated: AgentGrantResult[] = items
      .filter((it: any) => {
        // The core hallucination guard: only trust a result whose URL
        // is one we actually fetched for this category.
        const matchedPage = pages.find((p) => p.url === it?.url);
        return !!matchedPage && typeof it?.title === "string" && it.title.trim().length > 0;
      })
      .map((it: any) => ({
        category,
        title: it.title.trim(),
        funder: typeof it.funder === "string" ? it.funder.trim() : null,
        summary: typeof it.summary === "string" ? it.summary.trim() : "",
        eligibleApplicants: typeof it.eligibleApplicants === "string" ? it.eligibleApplicants.trim() : null,
        amountText: typeof it.amountText === "string" ? it.amountText.trim() : null,
        deadlineText: typeof it.deadlineText === "string" ? it.deadlineText.trim() : null,
        url: it.url,
      }));

    return { items: validated, tokens };
  } catch (err) {
    console.error(`searchBeyondProfile extraction failed for ${category}:`, err);
    return { items: [], tokens: 0 };
  }
}

export async function runAgentGrantSearch(
  profile: Pick<UserProfile, "focusAreas" | "mission" | "organizationName" | "state">
): Promise<AgentSearchOutcome> {
  const errors: string[] = [];
  const results: AgentGrantResult[] = [];
  let tokensUsed = 0;
  let pagesSearched = 0;

  // Sequential, not Promise.all: keeps OpenAI calls under the shared
  // "openai:global" rate limit from spiking all at once, and keeps
  // this bounded and easy to reason about within the route's function
  // timeout budget.
  for (const category of AGENT_SEARCH_CATEGORIES) {
    const { pages, error } = await searchCategory(profile, category);
    if (error) errors.push(error);
    pagesSearched += pages.length;

    if (pages.length > 0) {
      const { items, tokens } = await extractFromPages(category, pages);
      results.push(...items);
      tokensUsed += tokens;
    }
  }

  return { results, errors, tokensUsed, pagesSearched };
}
