import { NextResponse } from "next/server";
import { client } from "@/lib/openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { workspaceId } = params;
    const { events } = await req.json();

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    if (!events || !Array.isArray(events)) {
      return NextResponse.json(
        { error: "events array is required" },
        { status: 400 }
      );
    }

    const prompt = `
You are an AI assistant generating notification summaries for a workspace.

Workspace ID:
${workspaceId}

Events:
${events.map((e: any) => `- ${e.type}: ${e.message}`).join("\n")}

Provide:
1. A concise summary of recent activity
2. Any urgent items to highlight
3. Recommended next actions
    `;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return NextResponse.json({
      result: response.choices[0].message,
    });
  } catch (err: any) {
    console.error("Workspace notifications AI error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
