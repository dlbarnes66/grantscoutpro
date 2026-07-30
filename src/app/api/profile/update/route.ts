export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";



export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const profile = await req.json();

    const updated = await prisma.user.update({
      where: { id: userId },
      data: profile,
    });

    return NextResponse.json({
      success: true,
      profile: updated,
    });
  } catch (error) {
    console.error("PROFILE UPDATE ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
