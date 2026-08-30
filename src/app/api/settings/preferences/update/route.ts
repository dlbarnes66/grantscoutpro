import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await requireUser();
  const body = await req.json();

  const profile = await prisma.userProfile.upsert({
    where: { userId: user.id },
    update: body,
    create: {
      userId: user.id,
      ...body
    }
  });

  return NextResponse.json(profile);
}
