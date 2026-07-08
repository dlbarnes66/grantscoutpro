import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const userId = "test-user-id";
  const data = await req.json();

  const profile = await prisma.userProfile.upsert({
    where: { userId },
    update: {
      populationsServed: data.populations,
      geographicService: data.geoEligibility.split(",").map((x: string) => x.trim()),
      nonprofitStatus: data.restrictions,
    },
    create: {
      userId,
      populationsServed: data.populations,
      geographicService: data.geoEligibility.split(",").map((x: string) => x.trim()),
      nonprofitStatus: data.restrictions,
    },
  });

  return NextResponse.json({ profile });
}
