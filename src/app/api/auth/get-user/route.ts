import { NextResponse } from "next/server";
import { auth } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ user: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        workspaceMembers: true,
      },
    });

    return NextResponse.json({ user });
  } catch (err: any) {
    console.error("get-user error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
