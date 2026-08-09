import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// ===============================
// GET /api/search-history
// Returns the user's search history
// ===============================
export async function GET(req: NextRequest, context: { params: Record<string, string> }) {
  const { params } = context;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const history = await prisma.searchHistory.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(history);
}

// ===============================
// POST /api/search-history
// Saves a new search query
// ===============================
export async function POST(req: NextRequest, context: { params: Record<string, string> }) {
  const { params } = context;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { query } = await req.json();

  if (!query || typeof query !== "string") {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const entry = await prisma.searchHistory.create({
    data: {
      userId,
      query,
    },
  });

  return NextResponse.json(entry, { status: 201 });
}
