import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { shareSlug: string };

// GET: public, unauthenticated. Returns only what an external respondent
// needs to see - never the workspaceId, grantId, or createdById.
export async function GET(
  _req: NextRequest,
  { params: paramsPromise }: { params: Promise<Params> }
) {
  const params = await paramsPromise;

  try {
    const form = await prisma.workspaceForm.findUnique({
      where: { shareSlug: params.shareSlug },
      select: { title: true, description: true, fields: true, status: true },
    });

    if (!form || form.status === "draft") {
      // Draft forms aren't public yet - treat exactly like "doesn't exist"
      // rather than leaking that a slug is reserved.
      return NextResponse.json({ error: "This form isn't available." }, { status: 404 });
    }

    return NextResponse.json({ success: true, form });
  } catch (err: any) {
    console.error("PUBLIC FORM GET ERROR:", err);
    return NextResponse.json({ error: "Something went wrong loading this form." }, { status: 500 });
  }
}
