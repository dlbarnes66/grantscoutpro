// lib/grants/alerts/generateAlerts.ts

import type { Grant } from "@prisma/client";
import { applyAlertRules } from "./applyAlertRules";

export function generateAlerts(grants: Grant[]) {
  const results = [];

  for (const grant of grants) {
    const alertResult = applyAlertRules(grant);
    if (alertResult) {
      results.push(alertResult);
    }
  }

  return results;
}
