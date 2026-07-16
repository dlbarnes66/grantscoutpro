import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { grantIds } = await req.json();

    if (!Array.isArray(grantIds) || grantIds.length === 0) {
      return NextResponse.json(
        { error: "grantIds must be a non-empty array" },
        { status: 400 }
      );
    }

    const grants = await prisma.grant.findMany({
      where: { id: { in: grantIds } },
      select: {
        id: true,
        title: true,
        funder: true,
        amount: true,
        deadline: true,
        summary: true,
        eligibility: true,
      },
    });

    return NextResponse.json({ ok: true, grants });
  } catch (err) {
    console.error("Compare API error:", err);
    return NextResponse.json(
      { error: "Failed to load comparison data" },
      { status: 500 }
    );
  }
}
