import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { profile: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Auto-create profile if missing
  if (!user.profile) {
    const profile = await prisma.userProfile.create({
      data: { userId: user.id },
    });
    return NextResponse.json(profile);
  }

  return NextResponse.json(user.profile);
}

export async function PATCH(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const updated = await prisma.userProfile.upsert({
    where: { userId: user.id },
    update: body,
    create: { userId: user.id, ...body },
  });

  return NextResponse.json(updated);
}
