import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function GET() {
  const user = await requireUser();

  const count = await prisma.notification.count({
    where: {
      userId: user.id,
      read: false
    }
  });

  return NextResponse.json({ unread: count });
}
