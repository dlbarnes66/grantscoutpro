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
      country: body.country,
      state: body.state,
      city: body.city,
    },
    create: {
      userId: user!.id,
      ...body,
    },
  });

  return NextResponse.json(updated);
}
