import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { userId, role } = await req.json();

    if (!userId || !role) {
      return NextResponse.json(
        { error: "Missing userId or role" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    return NextResponse.json({ updated: true });
  } catch (err: any) {
    console.error("Update role error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
