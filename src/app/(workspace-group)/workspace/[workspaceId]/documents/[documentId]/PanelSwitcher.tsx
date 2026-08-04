"use client";

import GrantRiskAssessmentPanel from "./GrantRiskAssessmentPanel";
import GrantBudgetRiskPanel from "./GrantBudgetRiskPanel";
import GrantReadabilityOptimizerPanel from "./GrantReadabilityOptimizerPanel";
import GrantComplianceCheckerPanel from "./GrantComplianceCheckerPanel";
import GrantEvidenceStrengthPanel from "./GrantEvidenceStrengthPanel";
import GrantRiskHeatmapPanel from "./GrantRiskHeatmapPanel";
import GrantNarrativeCoherencePanel from "./GrantNarrativeCoherencePanel";
import GrantMultiYearImpactForecasterPanel from "./GrantMultiYearImpactForecasterPanel";
import GrantReviewerPanel from "./GrantReviewerPanel";
import GrantFunderMatchPanel from "./GrantFunderMatchPanel";
import GrantInlineAISuggestionsPanel from "./GrantInlineAISuggestionsPanel";

export default function PanelSwitcher({
  activePanel,
  workspaceId,
  documentId,
  userId,
  content,
  profile,
  cursorContext
}) {
  switch (activePanel) {
    case "risk":
      return (
        <GrantRiskAssessmentPanel
          workspaceId={workspaceId}
          documentId={documentId}
          userId={userId}
          content={content}
        />
      );

    case "budget":
      return (
        <GrantBudgetRiskPanel
          workspaceId={workspaceId}
          documentId={documentId}
          content={content}
        />
      );

    case "readability":
      return (
        <GrantReadabilityOptimizerPanel
          workspaceId={workspaceId}
          documentId={documentId}
          content={content}
        />
      );

    case "compliance":
      return (
        <GrantComplianceCheckerPanel
          workspaceId={workspaceId}
          documentId={documentId}
          content={content}
        />
      );

    case "evidence":
      return (
        <GrantEvidenceStrengthPanel
          workspaceId={workspaceId}
          documentId={documentId}
          content={content}
        />
      );

    case "heatmap":
      return (
        <GrantRiskHeatmapPanel
          workspaceId={workspaceId}
          documentId={documentId}
          content={content}
        />
      );

    case "coherence":
      return (
        <GrantNarrativeCoherencePanel
          workspaceId={workspaceId}
          documentId={documentId}
          content={content}
        />
      );

    case "impact":
      return (
        <GrantMultiYearImpactForecasterPanel
          workspaceId={workspaceId}
          documentId={documentId}
          content={content}
        />
      );

    case "review":
      return (
        <GrantReviewerPanel
          workspaceId={workspaceId}
          documentId={documentId}
          content={content}
        />
      );

    case "funders":
      return (
        <GrantFunderMatchPanel
          workspaceId={workspaceId}
          documentId={documentId}
          content={content}
          profile={profile}
        />
      );

    case "inline":
      return (
        <GrantInlineAISuggestionsPanel
          workspaceId={workspaceId}
          documentId={documentId}
          content={content}
          cursorContext={cursorContext}
        />
      );

    default:
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          Select a panel from the sidebar.
        </div>
      );
  }
}
