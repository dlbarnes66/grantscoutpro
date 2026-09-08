// lib/grants/foundations/fetchFoundations.ts
//
// There's no free API for "open private foundation grant opportunities" -
// good foundation databases (Candid/Foundation Directory Online,
// Instrumentl, GrantStation) are paid commercial products. What IS free
// and real: ProPublica's Nonprofit Explorer API, built on IRS Form 990
// filings (https://projects.propublica.org/nonprofits/api). It can't tell
// us about an open call for proposals with a deadline - 990s are historical
// financial filings, not opportunity listings - but it CAN tell us which
// foundations exist, roughly how large they are (revenue/assets from their
// most recent filing), and whether their name/filings match a keyword. That
// makes this a prospecting tool (surface plausible funders to research and
// add to the CRM pipeline), not a live-opportunities feed like federal or
// state grants. No API key required.
import axios from "axios";

export interface FoundationRaw {
  name?: string;
  ein?: string;
  state?: string;
  city?: string;
  nteeCode?: string;
  summary?: string;
  mission?: string;
  totalRevenue?: number | null;
  totalAssets?: number | null;
  latestFilingYear?: number | null;
  url?: string;
}

const SEARCH_URL = "https://projects.propublica.org/nonprofits/api/v2/search.json";
const ORG_URL = (ein: number) => `https://projects.propublica.org/nonprofits/api/v2/organizations/${ein}.json`;

// Cap how many org-detail lookups we make per search - each is a separate
// HTTP call, and this runs unattended off a schedule, so keep it bounded.
const MAX_DETAIL_LOOKUPS = 6;

/**
 * Searches ProPublica's Nonprofit Explorer for organizations matching a
 * keyword (typically drawn from the workspace's mission/focus areas),
 * optionally narrowed to one state, and enriches the top matches with
 * their most recent filing's financials. Returns [] on any API failure -
 * this is best-effort prospecting, not a hard dependency.
 */
export async function fetchFoundations(query: string, state?: string | null): Promise<FoundationRaw[]> {
  if (!query || query.trim().length === 0) return [];

  try {
    const params: Record<string, string> = { q: query };
    if (state) params["state[id]"] = state.toUpperCase();

    const searchRes = await axios.get(SEARCH_URL, { params, timeout: 15000 });
    const organizations: any[] = Array.isArray(searchRes.data?.organizations) ? searchRes.data.organizations : [];

    const candidates = organizations.slice(0, MAX_DETAIL_LOOKUPS);
    const results: FoundationRaw[] = [];

    for (const org of candidates) {
      const base: FoundationRaw = {
        name: org.name,
        ein: org.strein || String(org.ein ?? ""),
        state: org.state,
        city: org.city,
        nteeCode: org.ntee_code,
        url: org.ein ? `https://projects.propublica.org/nonprofits/organizations/${org.ein}` : undefined,
      };

      try {
        const detailRes = await axios.get(ORG_URL(org.ein), { timeout: 15000 });
        const filings: any[] = detailRes.data?.filings_with_data || [];
        const latest = filings.sort((a, b) => (b.tax_prd_yr || 0) - (a.tax_prd_yr || 0))[0];
        if (latest) {
          base.totalRevenue = typeof latest.totrevenue === "number" ? latest.totrevenue : null;
          base.totalAssets = typeof latest.totassetsend === "number" ? latest.totassetsend : null;
          base.latestFilingYear = latest.tax_prd_yr || null;
        }
      } catch (err) {
        // Financials are a nice-to-have; keep the base record without them.
        console.error(`ProPublica org detail lookup failed for EIN ${org.ein}:`, err);
      }

      results.push(base);
    }

    return results;
  } catch (err) {
    console.error("ProPublica foundation search failed:", err);
    return [];
  }
}
