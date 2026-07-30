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
