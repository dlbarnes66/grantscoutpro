import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const userId = "test-user-id";
  const data = await req.json();

  const profile = await prisma.userProfile.upsert({
    where: { userId },
    update: {
      staffSize: Number(data.staffSize),
      annualBudget: Number(data.annualBudget),
      grantExperience: data.readiness,
      pastGrants: data.pastGrants,
    },
    create: {
      userId,
      staffSize: Number(data.staffSize),
      annualBudget: Number(data.annualBudget),
      grantExperience: data.readiness,
      pastGrants: data.pastGrants,
    },
  });

  return NextResponse.json({ profile });
}
