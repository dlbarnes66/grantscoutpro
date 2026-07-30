import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { password } = await req.json();
  const hashed = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashed },
  });

  return NextResponse.json({ ok: true });
}
