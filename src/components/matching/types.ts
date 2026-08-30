export interface CategoryScore {
  name: string;
  score: number;
}

export interface EligibilityPreviewData {
  eligible: boolean;
  reasons: string[];
  issues: string[];
}

export interface FitAnalysisData {
  strengths: string[];
  weaknesses: string[];
}

export interface MatchResultItem {
  grant: {
    id: string;
    title: string;
  };
  score: number;
  explanation: string;
}
