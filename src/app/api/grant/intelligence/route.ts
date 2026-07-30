export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";



export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { grantId } = await req.json();

    if (!grantId) {
      return NextResponse.json(
        { error: "Missing grantId" },
        { status: 400 }
      );
    }

    // Load grant using ONLY valid fields from your schema
    const grant = await prisma.grant.findUnique({
      where: { id: grantId },
      select: {
        id: true,
        title: true,
        summary: true,
        description: true,
        category: true,
        agency: true,
        amount: true,
        deadline: true,
        url: true,
        industry: true,
        location: true,
      },
    });

    if (!grant) {
      return NextResponse.json(
        { error: "Grant not found" },
        { status: 404 }
      );
    }

    // Placeholder intelligence scoring
    const intelligence = {
      score: 0.75,
      insights: [
        "Grant appears aligned with workspace mission.",
        "Deadline is approaching soon.",
      ],
    };

    return NextResponse.json({
      success: true,
      grant,
      intelligence,
    });
  } catch (err: any) {
    console.error("GRANT INTELLIGENCE ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
