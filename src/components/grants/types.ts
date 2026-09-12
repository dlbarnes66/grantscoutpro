export interface Grant {
  id: string;
  title: string;
  agency?: string;
  deadline?: string;
  summary?: string;
}

export interface GrantACL {
  loading: boolean;
  canView: boolean;
  canEdit: boolean;
  canRunDocumentAI: boolean;
}

export interface GrantAIResult {
  result: string;
}

export interface GrantComparisonItem {
  id: string;
  title: string;
  agency: string | null;
  category: string | null;
  status: string;
  deadline: string | null;
  awardFloor: number | null;
  awardCeiling: number | null;
  totalFunding: number | null;
  aiEligibilityScore: number | null;
  aiAlignmentScore: number | null;
  aiCompetitivenessScore: number | null;
  aiRiskScore: number | null;
  aiReadinessScore: number | null;
  url: string | null;
}

export interface GrantComparisonResult {
  success: boolean;
  compared: GrantComparisonItem[];
  ignored: string[];
  aiSummary: string | null;
  error?: string;
}

export interface GrantEditorData {
  id: string;
  title: string;
  agency: string;
  deadline: string;
  summary: string;
}

export interface GrantViewerData {
  id: string;
  title: string;
  agency: string;
  deadline: string;
  summary: string;
  updatedAt: string;
}

export interface GrantMetaData {
  id: string;
  amount: number;
  deadline: string;
  category: string;
  description: string;
  matchScore: number;
}

export interface GrantListItem {
  id: string;
  title: string;
  agency: string;
  deadline: string;
}

export interface GrantIntelligenceResult {
  score: number;
  notes: string;
}

export interface EligibilityData {
  eligible: boolean;
  reasons: string[];
  issues: string[];
}
