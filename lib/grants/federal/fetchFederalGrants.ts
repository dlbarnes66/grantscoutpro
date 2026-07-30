// lib/grants/federal/fetchFederalGrants.ts

import axios from "axios";

export interface FederalGrantRaw {
  opportunityNumber?: string;
  opportunityTitle?: string;
  title?: string;
  summary?: string;
  description?: string;
  agency?: string;
  agencyName?: string;
  fundingCategory?: string;
  category?: string;
  closeDate?: string;
  postedDate?: string;
  lastUpdatedDate?: string;
  awardFloor?: number;
  awardCeiling?: number;
  estimatedTotalProgramFunding?: number;
  eligibility?: string;
  eligibleApplicants?: string;
  ineligibleApplicants?: string;
  url?: string;
  opportunityUrl?: string;
}

export async function fetchFederalGrants(): Promise<FederalGrantRaw[]> {
  const url =
    "https://www.grants.gov/grantsws/rest/opportunities/search?keyword=&oppStatuses=forecasted,posted";

  const res = await axios.get(url);

  if (!res.data?.opportunities) return [];

  return res.data.opportunities as FederalGrantRaw[];
}

