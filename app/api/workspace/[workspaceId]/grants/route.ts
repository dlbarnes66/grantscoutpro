import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const workspaceId = params.workspaceId;

    const grants = await prisma.grant.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        summary: true,
        status: true,
        priority: true,
        deadline: true
      }
    });

    return NextResponse.json({ grants });
  } catch (error) {
    console.error("Grant List Error:", error);
    return NextResponse.json(
      { error: "Failed to load grants" },
      { status: 500 }
    );
  }
}
