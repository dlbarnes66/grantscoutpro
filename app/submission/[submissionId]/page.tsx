"use client";

import { useEffect, useState } from "react";
import { SubmissionChecklist } from "@/components/submission/SubmissionChecklist";
import { RequiredAttachments } from "@/components/submission/RequiredAttachments";
import { FormattingChecks } from "@/components/submission/FormattingChecks";
import { ReadinessScore } from "@/components/submission/ReadinessScore";
import { FinalSubmissionPanel } from "@/components/submission/FinalSubmissionPanel";

export default function SubmissionWorkspacePage({ params }: { params: { id: string } }) {
  const [submissionData, setSubmissionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      // Placeholder — real AI integration comes later
      await new Promise((r) => setTimeout(r, 600));

      setSubmissionData({
        checklist: [
          { id: "narrative", label: "Narrative Completed", done: true },
          { id: "budget", label: "Budget Finalized", done: false },
          { id: "attachments", label: "Required Attachments Uploaded", done: false },
          { id: "compliance", label: "Compliance Checks Passed", done: true }
        ],
        attachments: [
          { id: "1", name: "IRS Determination Letter", uploaded: true },
          { id: "2", name: "Board List", uploaded: false },
          { id: "3", name: "Program Budget", uploaded: true }
        ],
        formatting: {
          issues: ["Narrative exceeds page limit", "Missing page numbers"],
          passed: false
        },
        readiness: 68
      });

      setLoading(false);
    }

    load();
  }, [params.id]);

  if (loading)
    return <div className="text-slate-400">Loading submission workspace...</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold text-slate-100">
        Submission Workspace
      </h1>

      <SubmissionChecklist checklist={submissionData.checklist} />

      <RequiredAttachments attachments={submissionData.attachments} />

      <FormattingChecks formatting={submissionData.formatting} />

      <ReadinessScore score={submissionData.readiness} />

      <FinalSubmissionPanel />
    </div>
  );
}
