import { NextResponse } from "next/server";
import { auth } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    let workspace = await prisma.workspace.findFirst({
      where: { members: { some: { userId } } },
    });

    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: {
          name: "My Workspace",
          slug: `ws-${userId}`,
          ownerId: userId,
          members: {
            create: {
              userId,
              role: "owner",
            },
          },
        },
      });
    }

    return NextResponse.json({ workspace });
  } catch (err: any) {
    console.error("ensure-user error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
