// app/profile/strategy/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function PATCH(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { strategy } = body;

  if (typeof strategy !== "object" || strategy === null) {
    return NextResponse.json(
      { error: "Strategy must be an object" },
      { status: 400 }
    );
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { strategy },
  });

  return NextResponse.json(updated);
}
