// lib/grants/alerts/applyAlertRules.ts

import type { Grant } from "@prisma/client";

type Alert = {
  type:
    | "NEW_GRANT"
    | "DEADLINE_SOON"
    | "HIGH_ALIGNMENT"
    | "HIGH_READINESS"
    | "FOUNDATION_UPDATE";
  message: string;
};

export function applyAlertRules(grant: Grant) {
  const alerts: Alert[] = [];
  const now = new Date();

  // Rule 1: New grant posted in last 48 hours
  if (grant.postedDate) {
    const diff = now.getTime() - new Date(grant.postedDate).getTime();
    if (diff < 48 * 60 * 60 * 1000) {
      alerts.push({
        type: "NEW_GRANT",
        message: `New ${grant.source.toLowerCase()} grant posted: ${grant.title}`,
      });
    }
  }

  // Rule 2: Deadline approaching (7 days)
  if (grant.deadline) {
    const diff = new Date(grant.deadline).getTime() - now.getTime();
    if (diff < 7 * 24 * 60 * 60 * 1000 && diff > 0) {
      alerts.push({
        type: "DEADLINE_SOON",
        message: `Deadline approaching for ${grant.title}`,
      });
    }
  }

  // Rule 3: High AI alignment score
  if (grant.aiAlignmentScore && grant.aiAlignmentScore >= 80) {
    alerts.push({
      type: "HIGH_ALIGNMENT",
      message: `${grant.title} has a high alignment score (${grant.aiAlignmentScore})`,
    });
  }

  // Rule 4: High readiness score
  if (grant.aiReadinessScore && grant.aiReadinessScore >= 75) {
    alerts.push({
      type: "HIGH_READINESS",
      message: `${grant.title} is highly ready for submission`,
    });
  }

  // Rule 5: Foundation updates
  if (grant.foundationMission || grant.foundationGivingAreas) {
    alerts.push({
      type: "FOUNDATION_UPDATE",
      message: `Foundation update detected for ${grant.foundationName || grant.title}`,
    });
  }

  return alerts.length > 0 ? { grantId: grant.id, alerts } : null;
}
