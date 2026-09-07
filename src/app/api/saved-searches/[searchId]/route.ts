import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { searchId: string };

export async function GET(
  _req: NextRequest,
  context: { params: Promise<Params> }
) {
  const params = await context.params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const search = await prisma.savedSearch.findUnique({
      where: { id: params.searchId },
    });

    if (!search || search.userId !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, search });
  } catch (err: any) {
    console.error("SAVED-SEARCH GET ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<Params> }
) {
  const params = await context.params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.name || !body.query) {
      return NextResponse.json({ error: "Missing name or query" }, { status: 400 });
    }

    const updated = await prisma.savedSearch.update({
      where: { id: params.searchId },
      data: {
        name: body.name,
        query: body.query,
      },
    });

    return NextResponse.json({ success: true, updated });
  } catch (err: any) {
    console.error("SAVED-SEARCH UPDATE ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<Params> }
) {
  const params = await context.params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await prisma.savedSearch.delete({
      where: { id: params.searchId },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("SAVED-SEARCH DELETE ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
