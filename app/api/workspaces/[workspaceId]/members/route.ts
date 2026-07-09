import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId: params.workspaceId },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ members });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
