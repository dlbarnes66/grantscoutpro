import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { grantId: string };

export async function GET(
  _req: NextRequest,
  { params }: { params: Params }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const saved = await prisma.savedGrant.findFirst({
      where: {
        userId,
        grantId: params.grantId,
      },
      include: { grant: true },
    });

    if (!saved) {
      return NextResponse.json(
        { success: false, saved: null },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, saved });
  } catch (err: any) {
    console.error("SAVED-GRANT GET ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Params }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { action } = body;

    const effectiveAction = action === "unsave" ? "unsave" : "save";

    if (effectiveAction === "unsave") {
      await prisma.savedGrant.deleteMany({
        where: {
          userId,
          grantId: params.grantId,
        },
      });

      return NextResponse.json({ success: true, removed: true });
    }

    const existing = await prisma.savedGrant.findFirst({
      where: {
        userId,
        grantId: params.grantId,
      },
    });

    let saved;
    if (existing) {
      saved = existing; // nothing else to update
    } else {
      saved = await prisma.savedGrant.create({
        data: {
          userId,
          grantId: params.grantId,
        },
      });
    }

    return NextResponse.json({ success: true, saved });
  } catch (err: any) {
    console.error("SAVED-GRANT POST ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
