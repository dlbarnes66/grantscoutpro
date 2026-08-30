export interface OutcomeItem {
  id: string;
  label: string;
  value: number;
}

export interface OutcomeReportingItem {
  id: string;
  label: string;
}

export interface ComplianceData {
  passed: boolean;
  issues: string[];
}

export interface KPIItem {
  label: string;
  current: number;
  target: number;
}

export interface MilestoneItem {
  id: string;
  label: string;
  date: string;
  done: boolean;
}

export interface ReviewerComment {
  reviewer: string;
  text: string;
  timestamp: string;
}

export interface ConsensusData {
  averageScore: number;
  strengths: string[];
  weaknesses: string[];
}

export interface ReviewerCard {
  id: string;
  name: string;
  role: string;
  score: number;
}

export interface ScoreMatrixCriterion {
  id: string;
  label: string;
  scores: number[];
}
