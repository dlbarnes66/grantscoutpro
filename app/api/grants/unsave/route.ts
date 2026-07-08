import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { userId, grantId } = await req.json();

    if (!userId || !grantId) {
      return NextResponse.json(
        { error: "Missing userId or grantId" },
        { status: 400 }
      );
    }

    await prisma.savedGrant.deleteMany({
      where: {
        userId,
        grantId,
      },
    });

    return NextResponse.json({ removed: true });
  } catch (err: any) {
    console.error("Unsave grant error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
