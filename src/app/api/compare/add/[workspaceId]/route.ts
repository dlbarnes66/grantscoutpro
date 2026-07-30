import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: any) {
  const { workspaceId } = params;
  const { grantId } = await req.json();

  let comparison = await prisma.grantComparison.findFirst({
    where: { workspaceId },
  });

  if (!comparison) {
    comparison = await prisma.grantComparison.create({
      data: {
        workspaceId,
        userId: "system",
        grants: [grantId],
      },
    });
  } else {
    const grants = comparison.grants as string[];
    if (!grants.includes(grantId)) {
      grants.push(grantId);
    }

    comparison = await prisma.grantComparison.update({
      where: { id: comparison.id },
      data: { grants },
    });
  }

  return NextResponse.json(comparison);
}
