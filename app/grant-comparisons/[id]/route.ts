import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const comparison = await prisma.grantComparison.findUnique({
    where: { id: params.id },
  });

  if (!comparison) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Load the actual grant data
  const grants = await prisma.savedGrant.findMany({
    where: { id: { in: comparison.grantIds } },
  });

  return NextResponse.json({ comparison, grants });
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.grantComparison.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ success: true });
}
