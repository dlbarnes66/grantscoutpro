import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { grantId: string } }
) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const grantId = params.grantId;

    await prisma.savedGrant.deleteMany({
      where: {
        grantId,
        orgId,
      },
    });

    return NextResponse.json({ unsaved: true });
  } catch (err: any) {
    console.error("UNSAVE GRANT ERROR:", err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
