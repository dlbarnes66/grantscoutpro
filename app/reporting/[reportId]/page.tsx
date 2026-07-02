"use client";

import { useEffect, useState } from "react";
import { KPIDashboard } from "@/components/reporting/KPIDashboard";
import { MilestoneTracker } from "@/components/reporting/MilestoneTracker";
import { OutcomeReporting } from "@/components/reporting/OutcomeReporting";
import { AIReportGenerator } from "@/components/reporting/AIReportGenerator";
import { ComplianceStatus } from "@/components/reporting/ComplianceStatus";

export default function ReportingWorkspacePage({ params }: { params: { id: string } }) {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      // Placeholder — real AI integration comes later
      await new Promise((r) => setTimeout(r, 600));

      setReportData({
        kpis: [
          { label: "Youth Served", target: 300, current: 220 },
          { label: "Workshops Delivered", target: 20, current: 14 },
          { label: "Volunteer Hours", target: 500, current: 410 }
        ],
        milestones: [
          { id: "1", label: "Program Launch", date: "2026-03-01", done: true },
          { id: "2", label: "Mid-Year Report", date: "2026-06-30", done: false },
          { id: "3", label: "Final Evaluation", date: "2026-12-15", done: false }
        ],
        outcomes: [
          { id: "1", label: "Improved leadership skills", evidence: "" },
          { id: "2", label: "Increased community engagement", evidence: "" }
        ],
        compliance: {
          passed: false,
          issues: ["Missing mid-year report", "Outcome evidence incomplete"]
        }
      });

      setLoading(false);
    }

    load();
  }, [params.id]);

  if (loading)
    return <div className="text-slate-400">Loading reporting workspace...</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold text-slate-100">
        Post‑Award Reporting
      </h1>

      <KPIDashboard kpis={reportData.kpis} />

      <MilestoneTracker milestones={reportData.milestones} />

      <OutcomeReporting outcomes={reportData.outcomes} />

      <AIReportGenerator outcomes={reportData.outcomes} />

      <ComplianceStatus compliance={reportData.compliance} />
    </div>
  );
}
