import { NextResponse } from "next/server";
import { client } from "@/lib/openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: { workspaceId: string } }) {
  try {
    const { workspaceId } = params;
    const { summary } = await req.json();

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    if (!summary) {
      return NextResponse.json(
        { error: "summary is required" },
        { status: 400 }
      );
    }

    const prompt = `
You are an AI assistant generating insights for a workspace dashboard.
Provide a concise, helpful summary of the workspace activity:

Workspace ID:
${workspaceId}

Activity Summary:
${summary}

Return:
- Key insights
- Recommended next actions
- Any risks or blockers
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
    console.error("Workspace dashboard AI error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
