// src/lib/grants/sbir/fetchSbirGrants.ts
//
// Client for the public SBIR.gov Solicitation API - federal SBIR/STTR
// awards, the standard route for a for-profit small business to get
// non-dilutive R&D funding. Unlike Grants.gov, these opportunities are
// open ONLY to small business concerns (which by SBIR/STTR program
// rules must be organized for profit) - so this source is only useful
// for a for-profit workspace, and is skipped entirely for everyone
// else (see runGrantScan.ts).
//
// Docs: https://www.sbir.gov/api/solicitation
// Endpoint: https://api.www.sbir.gov/public/api/solicitations
// No API key required per the published docs.
//
// KNOWN ISSUE (as of 2026-09-21): SBIR.gov's own docs page carries a
// banner that "the SBIR.gov APIs are currently undergoing maintenance,"
// and a direct request to the endpoint above currently returns a bare
// `403 Forbidden` with no body - confirmed by hand, not assumed. This
// client is written to the documented contract so it starts working
// the moment SBA restores the API; until then it fails the same way
// every other external source here fails (logged, non-fatal, scan
// moves on) rather than throwing.

const SBIR_SEARCH_URL = "https://api.www.sbir.gov/public/api/solicitations";

export class SbirRequestError extends Error {}

export interface SbirSolicitationTopic {
  topic_title?: string | null;
  branch?: string | null;
  topic_number?: string | null;
  topic_description?: string | null;
  sbir_topic_link?: string | null;
  subtopics?: unknown[] | null;
}

// Matches the field list published at sbir.gov/api/solicitation. The
// API is documented loosely (types/nullability aren't spelled out), so
// every field here is treated as possibly missing at parse time.
export interface SbirSolicitationRaw {
  solicitation_title?: string | null;
  solicitation_number?: string | null;
  program?: string | null; // "SBIR" | "STTR"
  phase?: string | null;
  agency?: string | null;
  branch?: string | null;
  solicitation_year?: number | string | null;
  release_date?: string | null;
  open_date?: string | null;
  close_date?: string | null;
  application_due_date?: string | string[] | null;
  occurrence_number?: string | null;
  solicitation_agency_url?: string | null;
  sbir_solicitation_link?: string | null;
  current_status?: string | null;
  solicitation_topics?: SbirSolicitationTopic[] | null;
}

const AGENCY_NAMES: Record<string, string> = {
  DOW: "Department of War",
  DOD: "Department of Defense",
  HHS: "Department of Health and Human Services",
  NASA: "National Aeronautics and Space Administration",
  NSF: "National Science Foundation",
  DOE: "Department of Energy",
  USDA: "United States Department of Agriculture",
  EPA: "Environmental Protection Agency",
  DOC: "Department of Commerce",
  ED: "Department of Education",
  DOT: "Department of Transportation",
  DHS: "Department of Homeland Security",
  SBA: "Small Business Administration",
};

export function sbirAgencyName(code: string | null | undefined): string | null {
  if (!code) return null;
  return AGENCY_NAMES[code.toUpperCase()] || code;
}

// The response envelope isn't nailed down in the public docs (and the
// endpoint is currently down - see the module comment), so this accepts
// either a bare array or the more typical { results / data / solicitations: [...] }
// wrapper rather than assuming one shape.
function extractList(json: any): SbirSolicitationRaw[] {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.results)) return json.results;
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json?.solicitations)) return json.solicitations;
  return [];
}

export async function fetchSbirGrants(
  keyword?: string,
  agency?: string,
  rows = 50
): Promise<SbirSolicitationRaw[]> {
  const url = new URL(SBIR_SEARCH_URL);
  url.searchParams.set("open", "1");
  url.searchParams.set("rows", String(rows));
  if (keyword) url.searchParams.set("keyword", keyword);
  if (agency) url.searchParams.set("agency", agency);

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new SbirRequestError(`SBIR.gov search failed (${res.status}): ${body.slice(0, 300)}`);
  }

  const json = await res.json().catch(() => null);
  const list = extractList(json);

  console.log(`[sbirGov] keyword=${JSON.stringify(keyword)} status=${res.status} resultsReturned=${list.length}`);

  return list;
}

// A solicitation can carry multiple due dates (one per topic/cycle).
// Picks the soonest one that's still a valid, parseable date.
export function earliestSbirDueDate(raw: SbirSolicitationRaw): Date | null {
  const values = Array.isArray(raw.application_due_date)
    ? raw.application_due_date
    : raw.application_due_date
    ? [raw.application_due_date]
    : [];

  const dates = values
    .map((v) => new Date(v))
    .filter((d) => !isNaN(d.getTime()));

  if (dates.length === 0) {
    if (raw.close_date) {
      const d = new Date(raw.close_date);
      return isNaN(d.getTime()) ? null : d;
    }
    return null;
  }

  return dates.sort((a, b) => a.getTime() - b.getTime())[0];
}

// Builds a short summary from the solicitation's topics, since the API
// doesn't return a single top-level description field for the
// solicitation itself.
export function summarizeSbirTopics(raw: SbirSolicitationRaw): string | null {
  const topics = Array.isArray(raw.solicitation_topics) ? raw.solicitation_topics : [];
  if (topics.length === 0) return null;

  const titles = topics
    .map((t) => t?.topic_title)
    .filter((t): t is string => typeof t === "string" && t.trim().length > 0);

  if (titles.length === 0) return null;

  const shown = titles.slice(0, 5).join("; ");
  const more = titles.length > 5 ? ` (+${titles.length - 5} more topics)` : "";
  return `Open topics: ${shown}${more}`;
}
