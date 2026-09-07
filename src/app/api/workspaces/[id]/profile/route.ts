import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const profile = await prisma.userProfile.findUnique({
    where: { userId },
  });

  return NextResponse.json({
    success: true,
    profile: {
      organizationName: profile?.organizationName ?? "",
      organizationType: profile?.organizationType ?? "",
      mission: profile?.mission ?? "",
      website: profile?.website ?? "",
      programs: profile?.focusAreas ?? [],
      serviceAreas: profile?.geographicService ?? [],
      populationsServed: profile?.populationsServed ?? [],
      annualBudget: profile?.annualBudget ?? null,
      staffSize: profile?.staffSize ?? null,
      grantExperience: profile?.grantExperience ?? "",
    },
  });
}
