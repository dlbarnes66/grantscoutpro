import { describe, expect, it } from "vitest";
import { ORG_TYPE_CODES, bucketBudgetForSf424A, extractCfdaNumber, extractOpportunityNumber } from "@/lib/documents/sf424";

describe("SF-424A budget buckets", () => {
  it("always reconciles with the original budget total", () => {
    const items = [
      { category: "Personnel", description: "Project director salary", amount: 60000 },
      { category: "Fringe", description: "Benefits", amount: 15000 },
      { category: "Travel", description: "Site visits", amount: 3000 },
      { category: "Supplies", description: "Office supplies", amount: 2000 },
      { category: "Mystery line", description: "Something unusual", amount: 1234 },
    ];
    const b = bucketBudgetForSf424A(items);
    expect(b.total).toBe(items.reduce((s, i) => s + i.amount, 0));
    for (const k of ["personnel", "fringe", "travel", "equipment", "supplies", "contractual", "construction", "other"] as const) {
      expect(b[k]).toBeGreaterThanOrEqual(0);
    }
  });

  it("returns zeros for an empty budget", () => {
    expect(bucketBudgetForSf424A([]).total).toBe(0);
  });
});

describe("opportunity and CFDA numbers", () => {
  it("prefers the stored value", () => {
    expect(extractOpportunityNumber({ opportunityNumber: " HHS-2027-001 " } as any)).toBe("HHS-2027-001");
    expect(extractCfdaNumber({ cfdaNumber: "93.600" } as any)).toBe("93.600");
  });
  it("returns null when nothing is available", () => {
    expect(extractOpportunityNumber({ raw: null } as any)).toBeNull();
    expect(extractCfdaNumber({ raw: {} } as any)).toBeNull();
  });
});

describe("SF-424 item 9 applicant type codes", () => {
  // Codes from the SF-424 instructions: G school district, H public college,
  // M 501(c)(3) nonprofit, O private college, P individual, Q for-profit.
  it("maps each organization type to the right federal code", () => {
    expect(ORG_TYPE_CODES["Nonprofit"].startsWith("M:")).toBe(true);
    expect(ORG_TYPE_CODES["School District"].startsWith("G:")).toBe(true);
    expect(ORG_TYPE_CODES["For-Profit"].startsWith("Q:")).toBe(true);
    expect(ORG_TYPE_CODES["Municipality"].startsWith("C:")).toBe(true);
    expect(ORG_TYPE_CODES["Tribal Government"].startsWith("I:")).toBe(true);
  });
  it("never labels an organization as an individual", () => {
    for (const v of Object.values(ORG_TYPE_CODES)) expect(v.startsWith("P:")).toBe(false);
  });
});
