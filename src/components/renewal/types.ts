export interface RenewalBudgetItem {
  id: string;
  category: string;
  previous: number;
  updated: number;
}

export interface RenewalEligibilityData {
  eligible: boolean;
  reasons: string[];
  issues: string[];
}
