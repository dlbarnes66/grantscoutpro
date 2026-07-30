import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  // Clerk authentication
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json([], { status: 200 });
  }

  const saved = await prisma.savedGrant.findMany({
    where: { userId },
    include: { grant: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(saved.map((s) => s.grant));
}
