import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: { grantId: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const comparison = await prisma.grantComparison.findFirst({
      where: {
        grants: {
          equals: params.grantId,
        },
      },
    });

    if (!comparison) {
      return NextResponse.json(
        { error: "No comparison found for this grant" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, comparison });
  } catch (err: any) {
    console.error("GRANT COMPARISON GET ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { grantId: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));

    const updated = await prisma.grantComparison.updateMany({
      where: {
        grants: {
          equals: params.grantId,
        },
      },
      data: body,
    });

    return NextResponse.json({ success: true, updated });
  } catch (err: any) {
    console.error("GRANT COMPARISON POST ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
