import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: any) {
  const { workspaceId } = params;

  const comparison = await prisma.grantComparison.findFirst({
    where: { workspaceId },
  });

  if (!comparison) {
    return NextResponse.json({ ok: true });
  }

  await prisma.grantComparison.update({
    where: { id: comparison.id },
    data: { grants: [] },
  });

  return NextResponse.json({ ok: true });
}
