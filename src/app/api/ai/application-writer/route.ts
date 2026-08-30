import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { prompt = "", grant = {}, org = {} } = await req.json().catch(() => ({}));

  if (!prompt) {
    return NextResponse.json(
      { error: "Missing 'prompt' field" },
      { status: 400 }
    );
  }

  const modelPrompt = `
You are an application-writing engine. Use the following information:

Grant:
${JSON.stringify(grant, null, 2)}

Organization:
${JSON.stringify(org, null, 2)}

Task:
${prompt}

Return a polished, competitive grant application section.
`;

  const result = await callUnifiedModel(modelPrompt);

  return NextResponse.json({
    success: true,
    application: result,
  });
}
