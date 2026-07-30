export interface APILogEntry {
  method: string;
  endpoint: string;
  body?: string;
  response: any;
  timestamp: string;
}

export interface APIResponse {
  status: number;
  data: any;
  timestamp: string;
}
