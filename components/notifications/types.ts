export interface Notification {
  id: string;
  type: "deadline" | "ai" | "collaboration" | "system";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}
