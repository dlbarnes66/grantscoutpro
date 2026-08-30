export interface CloseoutAsset {
  id: string;
  name: string;
  value: number;
  status: string;
}

export interface CloseoutChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface FinancialRecord {
  id: string;
  [key: string]: any;
}

