export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const userId = "test-user-id";
  const data = await req.json();

  const profile = await prisma.userProfile.upsert({
    where: { userId },
    update: {
      organizationName: data.name,
      organizationType: data.type,
      website: data.website,
      ein: data.ein,
    },
    create: {
      userId,
      organizationName: data.name,
      organizationType: data.type,
      website: data.website,
      ein: data.ein,
    },
  });

  return NextResponse.json({ profile });
}
