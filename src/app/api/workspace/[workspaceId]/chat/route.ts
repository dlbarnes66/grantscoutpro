import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await context.params;

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Missing workspaceId" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Fetch workspace context
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        documents: true,
        grants: true
      }
    });

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    // Example AI response (replace with your actual logic)
    const response = {
      answer: `AI response for workspace ${workspaceId}: ${message}`,
      sources: workspace.documents.map((doc) => ({
        id: doc.id,
        text: doc.title,
        score: Math.random()
      }))
    };

    return NextResponse.json({ response });
  } catch (err: any) {
    console.error("WORKSPACE CHAT ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
