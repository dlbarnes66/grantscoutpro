import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function POST() {
  const user = await requireUser();

  await prisma.$transaction(async (tx) => {
    await tx.apiKey.deleteMany({ where: { userId: user.id } });
    await tx.userProfile.deleteMany({ where: { userId: user.id } });
    await tx.user.delete({ where: { id: user.id } });
  });

  return NextResponse.json({ success: true });
}
