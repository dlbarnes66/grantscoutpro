import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  // Clerk authentication
  const { userId } = auth();
  if (!userId) return NextResponse.json(null);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });

  return NextResponse.json(user);
}

export async function POST(req: Request) {
  // Clerk authentication
  const { userId } = auth();
  if (!userId)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { name, organizationName, mission, website } = await req.json();

  await prisma.user.update({
    where: { id: userId },
    data: { name },
  });

  await prisma.userProfile.upsert({
    where: { userId },
    update: {
      organizationName,
      mission,
      website,
    },
    create: {
      userId,
      organizationName,
      mission,
      website,
    },
  });

  return NextResponse.json({ ok: true });
}
