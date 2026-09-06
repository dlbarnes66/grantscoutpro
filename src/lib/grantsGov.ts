// src/lib/grantsGov.ts
//
// Client for the federal Grants.gov "Simpler Grants" search API.
// Docs: https://wiki.simpler.grants.gov/product/api
// Requires a free API key from a Login.gov account - see
// https://wiki.simpler.grants.gov/product/api/simpler-grants-api-tutorial/create-your-account-and-get-your-api-key
// Set it as GRANTS_GOV_API_KEY in your environment.

const SEARCH_URL = "https://api.simpler.grants.gov/v1/opportunities/search";

export interface GrantsGovOpportunity {
  opportunity_id: string;
  opportunity_number: string | null;
  opportunity_title: string;
  agency_name: string | null;
  agency_code: string | null;
  post_date: string | null;
  close_date: string | null;
  opportunity_status: string | null;
  funding_instrument: string | null;
  funding_category: string | null;
  award_floor: number | null;
  award_ceiling: number | null;
  estimated_total_program_funding: number | null;
  expected_number_of_awards: number | null;
  summary?: string | null;
}

export class GrantsGovConfigError extends Error {}
export class GrantsGovRequestError extends Error {}

export async function searchFederalGrants(
  query: string,
  pageSize = 25
): Promise<GrantsGovOpportunity[]> {
  const apiKey = process.env.GRANTS_GOV_API_KEY;

  if (!apiKey) {
    throw new GrantsGovConfigError(
      "GRANTS_GOV_API_KEY is not set. Get a free key from Login.gov and add it to your environment - see wiki.simpler.grants.gov."
    );
  }

  const res = await fetch(SEARCH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
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
  return (json?.data ?? []) as GrantsGovOpportunity[];
}

// Grants.gov doesn't return a stable public detail URL in the search
// response, but opportunity_id can be used to build one for display.
export function grantsGovDetailUrl(opportunityId: string): string {
  return `https://www.grants.gov/search-results-detail/${opportunityId}`;
}
