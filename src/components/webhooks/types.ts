export interface Webhook {
  id: string;
  url: string;
  event: string;
  created: string;
}

export interface WebhookLogEntry {
  webhookId: string;
  url: string;
  event: string;
  payload: string;
  status: number;
  timestamp: string;
}
