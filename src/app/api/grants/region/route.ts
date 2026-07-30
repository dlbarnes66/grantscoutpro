export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { region } = await request.json();

    if (!region) {
      return NextResponse.json(
        { error: "Missing region" },
        { status: 400 }
      );
    }

    const grants = await prisma.grant.findMany({
      where: {
        location: {
          contains: region,
          mode: "insensitive",
        },
      },
      orderBy: { deadline: "asc" },
    });

    return NextResponse.json({ grants });
  } catch (err: any) {
    console.error("Region grants error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
