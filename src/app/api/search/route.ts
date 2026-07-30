export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const body = await req.json();
    const query: string = body.query?.trim();

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const results = await prisma.grant.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { summary: { contains: query, mode: "insensitive" } },
          { eligibleApplicants: { contains: query, mode: "insensitive" } },
          { foundationName: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: { deadline: "asc" },
      take: 50,
    });

    await prisma.savedSearch.create({
      data: {
        userId,
        name: `Search: ${query}`,
        query,
      },
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
