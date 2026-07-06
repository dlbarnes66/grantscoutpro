import { NextResponse } from "next/server";
import { client } from "@/lib/openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "file is required" },
        { status: 400 }
      );
    }

    const text = await file.text();

    const prompt = `
You are an expert grant reviewer. Analyze the uploaded document and provide:

1. A summary of the content  
2. Key strengths  
3. Weaknesses or risks  
4. Recommendations for improvement  

Document Content:
${text}
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
    console.error("Document upload analysis error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
