import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { prompt = "", context = {} } = await req.json().catch(() => ({}));

  if (!prompt) {
    return NextResponse.json(
      { error: "Missing 'prompt' field" },
      { status: 400 }
    );
  }

  const modelPrompt = `
You are a grant-generation engine. Use the following context:

Context:
${JSON.stringify(context, null, 2)}

Task:
${prompt}

Return a structured JSON response with:
- generatedText
- keyPoints
- recommendations
`;

  const result = await callUnifiedModel(modelPrompt);

  return NextResponse.json({
    success: true,
    generated: result,
  });
}
