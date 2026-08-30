export interface Invoice {
  id: string;
  number: string;
  status: "paid" | "open" | "uncollectible" | "void";
  amount_due: number; // cents
  created: number; // unix timestamp (seconds)
}

export interface UsageItem {
  category: string;
  quantity: number;
  cost: number;
}

export interface Overages {
  total: number;
  items: { category: string; cost: number }[];
}

export interface UsagePeriodData {
  start: number; // unix timestamp (seconds)
  end: number;   // unix timestamp (seconds)
}

export interface UsageSummaryData {
  ai_tokens: number;
  grant_searches: number;
  seats: number;
  cost: number;
}
