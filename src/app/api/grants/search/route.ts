import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, requireWorkspaceMember } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: { workspaceId: string } }) {
  const user = await requireUser();
  const { workspaceId } = params;

  await requireWorkspaceMember(workspaceId);

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  const results = await prisma.grant.findMany({
    where: {
      workspaceId,
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { summary: { contains: q, mode: "insensitive" } },
        { category: { contains: q, mode: "insensitive" } },
        { agency: { contains: q, mode: "insensitive" } }
      ]
    },
    take: 50
  });

  return NextResponse.json(results);
}
