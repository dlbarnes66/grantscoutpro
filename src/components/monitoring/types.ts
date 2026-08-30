export interface MonitoringAlert {
  id: string;
  type: "warning" | "critical";
  message: string;
}

export interface MonitoringForecastData {
  projectedImpact: number;
  projectedCompletion: string;
  notes: string;
}

export interface MonitoringKPI {
  label: string;
  current: number;
  target: number;
}
