export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  resource: string;
  severity: "info" | "warning" | "system";
  timestamp: string;
  ip: string;
  metadata: Record<string, any>;
}
