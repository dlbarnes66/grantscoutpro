import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const userId = "test-user-id"; // Replace with real auth later

  const profile = await prisma.userProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    return NextResponse.json({
      basics: { name: "", type: "", website: "", ein: "" },
      location: { state: "", county: "" },
      mission: { category: "", focusAreas: [] },
      capacity: { staffSize: "", annualBudget: "", readiness: "", pastGrants: "" },
      funding: { amount: "", purpose: "", timeline: "", urgency: "" },
      eligibility: {
        populations: [],
        orgType: "",
        geoEligibility: "",
        restrictions: ""
      }
    });
  }

  return NextResponse.json({
    basics: {
      name: profile.organizationName || "",
      type: profile.organizationType || "",
      website: profile.website || "",
      ein: profile.ein || "",
    },
    location: {
      state: profile.state || "",
      county: profile.city || "",
    },
    mission: {
      category: profile.strategicGoals || "",
      focusAreas: profile.focusAreas || [],
    },
    capacity: {
      staffSize: profile.staffSize?.toString() || "",
      annualBudget: profile.annualBudget?.toString() || "",
      readiness: profile.grantExperience || "",
      pastGrants: profile.pastGrants || "",
    },
    funding: {
      amount: profile.annualBudget?.toString() || "",
      purpose: profile.priorityAreas || "",
      timeline: "",
      urgency: "",
    },
    eligibility: {
      populations: profile.populationsServed || [],
      orgType: profile.organizationType || "",
      geoEligibility: profile.geographicService?.join(", ") || "",
      restrictions: profile.nonprofitStatus || "",
    }
  });
}
