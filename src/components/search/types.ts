export interface SearchFilters {
  minAmount?: number;
  deadline?: string;
  category?: string;
}

export interface GrantSearchItem {
  id: string;
  title: string;
  funder: string;
  amount: number;
  deadline: string;
  matchScore: number;
}
