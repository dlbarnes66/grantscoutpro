import { describe, expect, it } from "vitest";
import {
  MAX_MONTHS,
  MIN_MONTHS,
  buildWorkPlanTemplate,
  projectDates,
  renderWorkPlanText,
  sanitizeWorkPlan,
} from "@/lib/ai/workPlan";

describe("work plan template", () => {
  it("builds eight rows that stay inside the project length", () => {
    for (const months of [1, 3, 12, 36]) {
      const plan = buildWorkPlanTemplate(months);
      expect(plan.rows).toHaveLength(8);
      for (const row of plan.rows) {
        expect(row.startMonth).toBeGreaterThanOrEqual(1);
        expect(row.endMonth).toBeLessThanOrEqual(plan.durationMonths);
        expect(row.endMonth).toBeGreaterThanOrEqual(row.startMonth);
      }
    }
  });

  it("clamps the project length", () => {
    expect(buildWorkPlanTemplate(0).durationMonths).toBe(12);
    expect(buildWorkPlanTemplate(9999).durationMonths).toBe(MAX_MONTHS);
    expect(buildWorkPlanTemplate(-5).durationMonths).toBeGreaterThanOrEqual(MIN_MONTHS);
  });

  it("computes project start and end dates", () => {
    const { start, end } = projectDates(buildWorkPlanTemplate(12, "2027-01-01"));
    expect(start?.getUTCFullYear() ?? start?.getFullYear()).toBe(2027);
    expect(end).not.toBeNull();
    expect(end!.getTime()).toBeGreaterThan(start!.getTime());
  });

  it("renders readable text that names every activity", () => {
    const plan = buildWorkPlanTemplate(12, "2027-01-01");
    const text = renderWorkPlanText(plan);
    expect(text).toContain("Project startup");
    expect(text).toContain("Reporting and closeout");
  });

  it("rejects unusable input and cleans usable input", () => {
    expect(sanitizeWorkPlan(null)).toBeNull();
    expect(sanitizeWorkPlan("nope")).toBeNull();
    const cleaned = sanitizeWorkPlan(buildWorkPlanTemplate(6, "2027-03-01"));
    expect(cleaned?.durationMonths).toBe(6);
  });
});
