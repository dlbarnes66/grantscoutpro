export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";




export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: { profile: true },
      orderBy: { email: "asc" },
    });

    return NextResponse.json({ users });
  } catch (err: any) {
    console.error("Export Users Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
