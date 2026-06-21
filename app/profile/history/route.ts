import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function PATCH(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  const updated = await prisma.userProfile.upsert({
    where: { userId: user!.id },
    update: {
      pastGrants: body.pastGrants,
      pastWins: body.pastWins,
      pastLosses: body.pastLosses,
    },
    create: {
      userId: user!.id,
      ...body,
    },
  });

  return NextResponse.json(updated);
}
