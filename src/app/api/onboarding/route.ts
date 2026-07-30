export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, ...data } = body;

    const profile = await prisma.userProfile.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });

    return NextResponse.json({ profile });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
