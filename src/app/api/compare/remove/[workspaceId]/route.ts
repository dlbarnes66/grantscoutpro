import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: any) {
  const { workspaceId } = params;
  const { grantId } = await req.json();

  const comparison = await prisma.grantComparison.findFirst({
    where: { workspaceId },
  });

  if (!comparison) {
    return NextResponse.json({ error: "No comparison exists" }, { status: 404 });
  }

  const grants = (comparison.grants as string[]).filter(id => id !== grantId);

  const updated = await prisma.grantComparison.update({
    where: { id: comparison.id },
    data: { grants },
  });

  return NextResponse.json(updated);
}
