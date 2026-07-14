import { NextResponse } from "next/server";
import { ragChat } from "@/lib/ai/rag-chat";

export async function POST(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { message, history } = await req.json();

    const response = await ragChat({
      workspaceId: params.workspaceId,
      message,
      history: history || [],
    });

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
