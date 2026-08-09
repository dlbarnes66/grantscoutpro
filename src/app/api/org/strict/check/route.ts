import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id as string | undefined;
    const orgId = session?.user?.orgId as string | undefined;
    const role = session?.user?.role as string | undefined;
    const superAdmin = session?.user?.superAdmin as boolean | undefined;

    if (!session || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!orgId) {
      return NextResponse.json({ error: "User is not assigned to an org" }, { status: 403 });
    }

    const org = await prisma.org.findUnique({
      where: { id: orgId },
      include: {
        users: true,
        Workspace: true,
      },
    });

    if (!org) {
      return NextResponse.json({ error: "Org not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      org,
      user: {
        id: userId,
        role,
        superAdmin: !!superAdmin,
      },
    });
  } catch (err: any) {
    console.error("ORG STRICT CHECK ERROR:", err);
    return NextResponse.json({ error: err.message ?? "Internal error" }, { status: 500 });
  }
}
