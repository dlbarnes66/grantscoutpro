export interface AiUsageStats {
  totalRequests: number;
  totalTokens: number;
  activeUsers: number;
}

export interface PlatformAnalyticsStats {
  totalUsers: number;
  activeWorkspaces: number;
  documents: number;
  aiRequests: number;
}

export interface RecoveryStats {
  totalUsers: number;
  activeWorkspaces: number;
  documents: number;
  aiRequests: number;
}

export interface EmergencyActionPayload {
  action: string;
  payload: Record<string, any>;
}

export interface EmergencyResponse {
  status: string;
  message?: string;
  details?: any;
}

export interface WorkspaceRepairResponse {
  status: string;
  repaired?: boolean;
  details?: any;
}
