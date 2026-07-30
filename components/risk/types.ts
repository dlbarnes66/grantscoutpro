export interface RiskCategory {
  id: string;
  label: string;
  level: "low" | "medium" | "high";
}

export interface RiskDetailsMap {
  [category: string]: string[];
}

export interface RiskReportData {
  risk_score: number;
  summary: string;
  compliance_issues: string[];
  recommendations: string[];
}
