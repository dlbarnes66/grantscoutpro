export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { grantId, prompt } = await request.json();

    if (!grantId || !prompt) {
      return NextResponse.json(
        { error: "Missing grantId or prompt" },
        { status: 400 }
      );
    }

    // Load grant using the correct Prisma model
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
        raw: true,
      },
    });

    if (!grant) {
      return NextResponse.json(
        { error: "Grant not found" },
        { status: 404 }
      );
    }

    // Placeholder writing assistance
    const writing = {
      generatedText: `Draft response based on prompt: "${prompt}" for grant "${grant.title}".`,
      suggestions: [
        "Clarify alignment with grant goals.",
        "Highlight measurable outcomes.",
        "Strengthen narrative cohesion.",
      ],
    };

    return NextResponse.json({
      success: true,
      grant,
      writing,
    });
  } catch (err: any) {
    console.error("GRANT WRITE ERROR:", err);
    return NextResponse.json(
      { error: err?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
