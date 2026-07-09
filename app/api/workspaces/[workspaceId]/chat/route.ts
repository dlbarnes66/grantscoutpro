import { NextResponse } from "next/server";
import { ragChat } from "@/lib/ai/rag-chat";
import { sendNotification } from "@/lib/notifications/sendNotification";
import { logActivity } from "@/lib/ai/activity-log";

export async function POST(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { message, history } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // ⭐ Perform RAG chat completion
    const completion = await ragChat({
      workspaceId: params.workspaceId,
      message,
      history: history || [],
    });

    // ⭐ Log activity
    await logActivity(params.workspaceId, "rag_chat", {
      message,
      responseLength: completion.length,
    });

    // ⭐ Send notification
    await sendNotification(
      params.workspaceId,
      "rag_chat",
      `AI responded to: "${message}"`,
      {
        message,
        responseLength: completion.length,
      }
    );

    return NextResponse.json({
      completion,
    });
  } catch (error: any) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
