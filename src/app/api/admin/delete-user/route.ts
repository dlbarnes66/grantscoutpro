import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }

    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({ deleted: true });
  } catch (err: any) {
    console.error("Delete user error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
