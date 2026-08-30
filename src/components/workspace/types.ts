export interface WorkspaceActivity {
  id: string;
  type: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface AdminSectionData {
  [key: string]: any;
}
