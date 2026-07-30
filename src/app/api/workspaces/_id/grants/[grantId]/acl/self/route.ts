export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";



export async function GET(
  req: Request,
  { params }: { params: { workspaceId: string; grantId: string } }
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized: No user session" },
        { status: 401 }
      );
    }

    const { grantId } = params;

    const access = await prisma.grantAccess.findFirst({
      where: {
        grantId,
        userId,
      },
      select: {
        id: true,
        canView: true,
        canEdit: true,
        canRunAI: true, // ⭐ correct field name
      },
    });

    return NextResponse.json({ access });
  } catch (err: any) {
    console.error("GRANT SELF ACL ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
