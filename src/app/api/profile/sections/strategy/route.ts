export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const userId = "test-user-id";
  const data = await req.json();

  const profile = await prisma.userProfile.upsert({
    where: { userId },
    update: {
      annualBudget: Number(data.amount),
      priorityAreas: data.purpose,
    },
    create: {
      userId,
      annualBudget: Number(data.amount),
      priorityAreas: data.purpose,
    },
  });

  return NextResponse.json({ profile });
}
