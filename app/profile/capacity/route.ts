// app/profile/capacity/route.ts
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
  const { capacity } = body;

  if (typeof capacity !== "number") {
    return NextResponse.json(
      { error: "Capacity must be a number" },
      { status: 400 }
    );
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { capacity },
  });

  return NextResponse.json(updated);
}
