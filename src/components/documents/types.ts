export interface DocumentSummary {
  id: string;
  title: string;
  updatedAt: string;
}

export interface DocumentData {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

export interface DocumentACL {
  loading: boolean;
  canView: boolean;
  canEdit: boolean;
}
