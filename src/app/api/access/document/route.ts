import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const documentId = req.nextUrl.searchParams.get("documentId");
  if (!documentId) {
    return NextResponse.json({ error: "documentId is required" }, { status: 400 });
  }

  try {
    const access = await prisma.documentAccess.findFirst({
      where: { documentId, userId },
    });

    return NextResponse.json({ success: true, access: !!access });
  } catch (err: any) {
    console.error("DOCUMENT ACCESS ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
