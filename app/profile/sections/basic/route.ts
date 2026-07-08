// app/profile/sections/basic/route.ts
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
  const { basic } = body;

  if (typeof basic !== "object" || basic === null) {
    return NextResponse.json(
      { error: "Basic section must be an object" },
      { status: 400 }
    );
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { basic },
  });

  return NextResponse.json(updated);
}
