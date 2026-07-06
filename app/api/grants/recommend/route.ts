import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  try {
    const { query } = await req.json();

    // ⭐ FIXED — embedding list is never null, so use isEmpty: false
    const grants = await prisma.grant.findMany({
      where: { embedding: { isEmpty: false } },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        agency: true,
        summary: true,
        amount: true,
        deadline: true,
        industry: true,
        location: true,
        fundingRange: true,
        status: true,
        embedding: true
      }
    });

    if (grants.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No grants have embeddings yet."
      });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a grant recommendation engine."
        },
        {
          role: "user",
          content: `User query: ${query}\n\nAvailable grants: ${JSON.stringify(
            grants
          )}`
        }
      ]
    });

    return NextResponse.json({
      success: true,
      recommendations: response.choices[0].message.content
    });
  } catch (error) {
    console.error("RECOMMENDATION ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}
