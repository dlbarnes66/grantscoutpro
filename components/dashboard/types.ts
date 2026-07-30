export interface KPIItem {
  label: string;
  value: string;
}

export interface PipelineStage {
  label: string;
  count: number;
}

export interface RecentActivityItem {
  text: string;
}

export interface FeatureItem {
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}
