import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Load the comparison record
  const comparison = await prisma.grantComparison.findUnique({
    where: { id: params.id },
  });

  if (!comparison) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Load the full grant data for each ID
  const grants = await prisma.grantPreview.findMany({
    where: { id: { in: comparison.grantIds } },
  });

  return NextResponse.json({ grants });
}
