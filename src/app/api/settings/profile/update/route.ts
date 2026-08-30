import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await requireUser();
  const body = await req.json();

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      name: body.name,
      image: body.image
    }
  });

  const updatedProfile = await prisma.userProfile.upsert({
    where: { userId: user.id },
    update: body.profile || {},
    create: {
      userId: user.id,
      ...(body.profile || {})
    }
  });

  return NextResponse.json({
    user: updatedUser,
    profile: updatedProfile
  });
}
