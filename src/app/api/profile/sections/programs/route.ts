export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const userId = "test-user-id";
  const data = await req.json();

  const profile = await prisma.userProfile.upsert({
    where: { userId },
    update: {
      strategicGoals: data.category,
      focusAreas: data.focusAreas,
    },
    create: {
      userId,
      strategicGoals: data.category,
      focusAreas: data.focusAreas,
    },
  });

  return NextResponse.json({ profile });
}
