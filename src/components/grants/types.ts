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
  agency: string;
  deadline: string;
  score: number;
}

export interface GrantComparisonResult {
  compared: GrantComparisonItem[];
  ignored: string[];
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
