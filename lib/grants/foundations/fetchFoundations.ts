// lib/grants/foundations/fetchFoundations.ts

import axios from "axios";

export interface FoundationRaw {
  name?: string;
  foundationName?: string;
  summary?: string;
  description?: string;
  givingAreas?: string | string[];
  deadline?: string;
  postedDate?: string;
  updatedDate?: string;
  minGrant?: number;
  maxGrant?: number;
  totalFunding?: number;
  eligibility?: string;
  eligibleApplicants?: string;
  ineligibleApplicants?: string;
  geographicFocus?: string;
  eligibleStates?: string;
  url?: string;
  website?: string;
  ein?: string;
  mission?: string;
  restrictions?: string;
  pastGrantees?: any;
  boardMembers?: any;
  form990PF?: any;
  type?: string;
  focus?: string;
  history?: any;
}

export async function fetchFoundations(): Promise<FoundationRaw[]> {
  const urls = [
    "https://api.example-foundations.org/foundations",
    "https://api.example-philanthropy.org/data",
  ];

  const results: FoundationRaw[] = [];

  for (const url of urls) {
    try {
      const res = await axios.get(url);

      if (Array.isArray(res.data)) {
        results.push(...(res.data as FoundationRaw[]));
      } else if (Array.isArray(res.data?.foundations)) {
        results.push(...(res.data.foundations as FoundationRaw[]));
      }
    } catch (err) {
      console.error("Foundation fetch error:", err);
    }
  }

  return results;
}
