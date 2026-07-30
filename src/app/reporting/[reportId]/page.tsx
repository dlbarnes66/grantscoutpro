import React from "react";
import KPIDashboard from "@/components/reporting/KPIDashboard";
import MilestoneTracker from "@/components/reporting/MilestoneTracker";
import OutcomeReporting from "@/components/reporting/OutcomeReporting";
import ComplianceStatus from "@/components/reporting/ComplianceStatus";

export default function ReportingPage({
  params,
}: {
  params: { reportId: string };
}) {
  const { reportId } = params;

  const kpis: any[] = [];
  const milestones: any[] = [];
  const outcomesReporting: any[] = [];
  const compliance: any = {};

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-100">
        Reporting — {reportId}
      </h1>

      <KPIDashboard kpis={kpis} />
      <MilestoneTracker milestones={milestones} />
      <OutcomeReporting outcomes={outcomesReporting} />
      <ComplianceStatus compliance={compliance} />
    </div>
  );
}
