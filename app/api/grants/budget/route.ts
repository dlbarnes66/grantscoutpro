import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { openai } from "@/lib/openai";

export async function GET(
  req: Request,
  { params }: { params: { grantId: string } }
) {
  try {
    const grantId = params.grantId;

    const budget = await prisma.grantBudget.findUnique({
      where: { grantId },
    });

    return NextResponse.json({ budget });
  } catch (error) {
    console.error("Budget Load Error:", error);
    return NextResponse.json(
      { error: "Failed to load budget" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { grantId, items, useAI } = await req.json();

    let finalItems = items;

    if (useAI) {
      const prompt = `
You are an expert grant budget designer.

Grant ID: ${grantId}

Create a simple budget with line items, amounts, and categories.

Return ONLY valid JSON:

{
  "items": [
    { "label": "...", "amount": 0, "category": "..." }
  ]
}
`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      });

      const ai = JSON.parse(completion.choices[0].message.content);
      finalItems = ai.items;
    }

    const total = finalItems.reduce(
      (sum: number, item: any) => sum + (item.amount || 0),
      0
    );

    const budget = await prisma.grantBudget.upsert({
      where: { grantId },
      update: {
        items: finalItems,
        total
      },
      create: {
        grantId,
        items: finalItems,
        total
      }
    });

    return NextResponse.json({ success: true, budget });
  } catch (error) {
    console.error("Budget Save Error:", error);
    return NextResponse.json(
      { error: "Failed to save budget" },
      { status: 500 }
    );
  }
}
