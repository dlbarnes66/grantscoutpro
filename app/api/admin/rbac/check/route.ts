import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { userId, permission } = await req.json();

    if (!userId || !permission) {
      return NextResponse.json(
        { error: "Missing userId or permission" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return NextResponse.json({ allowed: false });
    }

    const allowed = user.role === "admin" || user.role === permission;

    return NextResponse.json({ allowed });
  } catch (err: any) {
    console.error("RBAC check error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
