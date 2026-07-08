import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { grantIds, workspaceId, name } = await req.json();

    if (!grantIds || !workspaceId) {
      return NextResponse.json(
        { error: "Missing grantIds or workspaceId" },
        { status: 400 }
      );
    }

    // Placeholder comparison logic – you can extend this later
    const analysis = {
      similarityScore: Math.random() * 100,
      notes: "Automated comparison placeholder",
    };

    const comparison = await prisma.grantComparison.create({
      data: {
        userId: "system", // or real userId from headers/session
        workspaceId,
        grantIds,
        name: name ?? "Untitled Comparison",
        analysis,
      },
    });

    return NextResponse.json(comparison);
  } catch (error) {
    console.error("Error creating grant comparison:", error);
    return NextResponse.json(
      { error: "Failed to create grant comparison" },
      { status: 500 }
    );
  }
}
