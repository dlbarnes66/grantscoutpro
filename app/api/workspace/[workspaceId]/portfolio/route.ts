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
    const { grants } = await req.json();

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    if (!grants || !Array.isArray(grants)) {
      return NextResponse.json(
        { error: "grants array is required" },
        { status: 400 }
      );
    }

    const prompt = `
You are an AI assistant analyzing a grant portfolio for a workspace.

Workspace ID:
${workspaceId}

Grants:
${grants
  .map(
    (g: any) =>
      `- ${g.title || "Untitled"}: status=${g.status || "unknown"}, amount=${
        g.amount || "N/A"
      }`
  )
  .join("\n")}

Provide:
1. Portfolio summary
2. Funding distribution insights
3. Risk areas
4. Strategic recommendations
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
    console.error("Workspace portfolio AI error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
