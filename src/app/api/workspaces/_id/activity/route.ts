import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await context.params;

    // Extract userId from auth (adjust based on your auth system)
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { error: "Missing user authentication" },
        { status: 401 }
      );
    }

    // Validate workspace membership
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId
        }
      }
    });

    if (!membership) {
      return NextResponse.json(
        { error: "User is not a member of this workspace" },
        { status: 403 }
      );
    }

    // Fetch workspace activity
    const activity = await prisma.workspaceActivity.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ success: true, activity });
  } catch (err: any) {
    console.error("WORKSPACE ACTIVITY ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
