import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id as string | undefined;
    const orgId = session?.user?.orgId as string | undefined;

    if (!session || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!orgId) {
      return NextResponse.json({ error: "User is not assigned to an org" }, { status: 403 });
    }

    const owned = await prisma.sharedResource.findMany({
      where: { ownerOrgId: orgId },
      include: { accesses: true },
    });

    const sharedWith = await prisma.sharedResource.findMany({
      where: { sharedWithId: orgId },
      include: { accesses: true },
    });

    return NextResponse.json({
      success: true,
      owned,
      sharedWith,
    });
  } catch (err: any) {
    console.error("ORG SHARE LIST ERROR:", err);
    return NextResponse.json({ error: err.message ?? "Internal error" }, { status: 500 });
  }
}
