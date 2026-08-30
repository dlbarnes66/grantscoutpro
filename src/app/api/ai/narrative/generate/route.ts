import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { prompt = "", grant = {}, org = {} } = await req.json().catch(() => ({}));

  const modelPrompt = `
Generate a grant narrative.

Grant:
${JSON.stringify(grant, null, 2)}

Organization:
${JSON.stringify(org, null, 2)}

Task:
${prompt}

Return JSON with:
- narrative
- keyPoints
- recommendations
`;

  const result = await callUnifiedModel(modelPrompt);

  return NextResponse.json({ success: true, narrative: result });
}
