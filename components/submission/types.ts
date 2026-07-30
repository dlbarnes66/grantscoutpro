export interface FormattingCheckData {
  passed: boolean;
  issues: string[];
}

export interface RequiredAttachment {
  id: string;
  name: string;
  uploaded: boolean;
}

export interface SubmissionChecklistItem {
  id: string;
  label: string;
  done: boolean;
}
