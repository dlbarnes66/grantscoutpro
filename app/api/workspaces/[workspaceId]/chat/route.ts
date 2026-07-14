import { NextResponse } from "next/server";
import { requireWorkspaceRole } from "@/lib/auth/workspace-permissions";
import { checkUsage } from "@/lib/billing/check-usage";
import { incrementUsage } from "@/lib/billing/increment-usage";
import { generateAIResponse } from "@/lib/ai/chat";

export async function POST(req: Request, { params }) {
  try {
    await requireWorkspaceRole(params.workspaceId, ["ADMIN", "MEMBER"]);

    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    const usage = await checkUsage(params.workspaceId, "ai");
    if (!usage.allowed) {
      return NextResponse.json(
        {
          error: "AI usage limit reached",
          upgrade: true,
          plan: usage.plan,
          limit: usage.limit,
        },
        { status: 402 }
      );
    }

    const aiResponse = await generateAIResponse(params.workspaceId, message);

    await incrementUsage(params.workspaceId, "ai");

    return NextResponse.json({ response: aiResponse });
  } catch (error: any) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
