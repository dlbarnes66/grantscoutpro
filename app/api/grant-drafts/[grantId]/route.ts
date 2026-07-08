import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { grantId: string } }
) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const drafts = await prisma.grantDraft.findMany({
      where: {
        userId,
        grantId: params.grantId,
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(drafts);
  } catch (error) {
    console.error("Error fetching grant drafts:", error);
    return NextResponse.json(
      { error: "Failed to fetch drafts" },
      { status: 500 }
    );
  }
}
