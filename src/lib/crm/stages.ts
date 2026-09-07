// Single source of truth for the CRM pipeline funnel, shared by the API
// routes and the pipeline board UI.
export const CRM_STAGES = [
  { id: "lead", label: "Lead" },
  { id: "contacted", label: "Contacted" },
  { id: "pipeline", label: "In Pipeline" },
  { id: "negotiating", label: "Negotiating" },
  { id: "won", label: "Won" },
  { id: "lost", label: "Lost" },
] as const;

export type CrmStage = (typeof CRM_STAGES)[number]["id"];

export const CRM_STAGE_IDS: CrmStage[] = CRM_STAGES.map((s) => s.id);

export function isCrmStage(value: unknown): value is CrmStage {
  return typeof value === "string" && (CRM_STAGE_IDS as string[]).includes(value);
}

export function stageLabel(stage: string): string {
  return CRM_STAGES.find((s) => s.id === stage)?.label ?? stage;
}
