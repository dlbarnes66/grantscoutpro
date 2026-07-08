import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { grantIds } = await req.json();

  if (!Array.isArray(grantIds) || grantIds.length === 0) {
    return NextResponse.json({ error: "No grant IDs provided" }, { status: 400 });
  }

  const grants = await prisma.grantPreview.findMany({
    where: { id: { in: grantIds } },
  });

  return NextResponse.json({ grants });
}
