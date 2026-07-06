// app/api/search/semantic/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json(
        { success: false, error: "Missing query" },
        { status: 400 }
      );
    }

    // Fetch only grants that actually have embeddings
    const grants = await prisma.grant.findMany({
      where: {
        embedding: {
          isEmpty: false, // ⭐ valid list filter for Float[]
        },
      },
    });

    // Placeholder ranking logic — you can plug in real similarity later
    const ranked = grants.map((grant) => ({
      grant,
      score: Math.random(), // temporary scoring
    }));

    ranked.sort((a, b) => b.score - a.score);

    return NextResponse.json({
      success: true,
      results: ranked.map((r) => r.grant),
    });
  } catch (error) {
    console.error("SEMANTIC SEARCH ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to perform semantic search" },
      { status: 500 }
    );
  }
}
