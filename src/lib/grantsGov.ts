// src/lib/grantsGov.ts
//
// Client for the federal Grants.gov "Simpler Grants" search API.
// Docs: https://wiki.simpler.grants.gov/product/api
// Requires a free API key from a Login.gov account - see
// https://wiki.simpler.grants.gov/product/api/simpler-grants-api-tutorial/create-your-account-and-get-your-api-key
// Reads GRANTSGOV_API_KEY (falls back to GRANTS_GOV_API_KEY for compatibility).
//
// NOTE: the live API nests most fields (deadline, award amounts, funding
// category, the long description) inside a `summary` sub-object rather
// than at the top level -- confirmed against a real response on
// 2026-09-09. The interface below matches that actual shape.

const SEARCH_URL = "https://api.simpler.grants.gov/v1/opportunities/search";

export interface GrantsGovOpportunitySummary {
  close_date: string | null;
  post_date: string | null;
  award_floor: number | null;
  award_ceiling: number | null;
  estimated_total_program_funding: number | null;
  expected_number_of_awards: number | null;
  funding_categories: string[] | null;
  funding_category_description: string | null;
  funding_instruments: string[] | null;
  summary_description: string | null;
}

export interface GrantsGovOpportunity {
  opportunity_id: string;
  opportunity_number: string | null;
  opportunity_title: string;
  agency_name: string | null;
  agency_code: string | null;
  opportunity_status: string | null;
  category: string | null;
  top_level_agency_name: string | null;
  summary: GrantsGovOpportunitySummary | null;
}

export class GrantsGovConfigError extends Error {}
export class GrantsGovRequestError extends Error {}

export async function searchFederalGrants(
  query: string,
  pageSize = 25
): Promise<GrantsGovOpportunity[]> {
  const apiKey = process.env.GRANTSGOV_API_KEY || process.env.GRANTS_GOV_API_KEY;

  if (!apiKey) {
    throw new GrantsGovConfigError(
      "GRANTSGOV_API_KEY is not set. Get a free key from Login.gov and add it to your environment - see wiki.simpler.grants.gov."
    );
  }

  const res = await fetch(SEARCH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey.trim(),
    },
    body: JSON.stringify({
      query: query || undefined,
      filters: {
        opportunity_status: { one_of: ["posted", "forecasted"] },
      },
      pagination: {
        page_offset: 1,
        page_size: pageSize,
        sort_order: [{ order_by: "close_date", sort_direction: "ascending" }],
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new GrantsGovRequestError(
      `Grants.gov search failed (${res.status}): ${body.slice(0, 300)}`
    );
  }

  const json = await res.json().catch(() => null);
  const data = (json?.data ?? []) as GrantsGovOpportunity[];

  // Diagnostic logging -- shows up in Vercel's function logs. Helps
  // distinguish "Grants.gov genuinely has nothing for this query" from
  // "something's wrong with the request/response" without exposing the
  // API key itself.
  console.log(
    `[grantsGov] query=${JSON.stringify(query)} status=${res.status} resultsReturned=${data.length} totalRecords=${json?.pagination_info?.total_records ?? "unknown"}`
  );

  return data;
}

// Strips HTML tags and collapses whitespace so the long, HTML-formatted
// summary_description from Grants.gov is safe to render as plain text.
export function stripHtml(html: string | null | undefined): string | null {
  if (!html) return null;
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&rsquo;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
  return text.length > 0 ? text : null;
}

// Grants.gov doesn't return a stable public detail URL in the search
// response, but opportunity_id can be used to build one for display.
export function grantsGovDetailUrl(opportunityId: string): string {
  return `https://www.grants.gov/search-results-detail/${opportunityId}`;
}
