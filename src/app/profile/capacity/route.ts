import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized: No user session" },
        { status: 401 }
      );
    }

    const { capacity } = await req.json();

    if (capacity === undefined) {
      return NextResponse.json(
        { error: "Missing capacity value" },
        { status: 400 }
      );
    }

    // Now that User.capacity exists, we can update it safely
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { capacity },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("CAPACITY UPDATE ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
