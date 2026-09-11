import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = Promise<{ id: string }>;

async function requireMembership(workspaceId: string, userId: string) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: { members: { where: { status: "active" } } },
  });
  if (!workspace) return null;
  const isMember =
    workspace.ownerId === userId || workspace.members.some((m) => m.userId === userId);
  return isMember ? workspace : null;
}

// GET - list every file uploaded to this workspace.
export async function GET(_req: NextRequest, { params }: { params: Params }) {
  try {
    const { id: workspaceId } = await params;
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const workspace = await requireMembership(workspaceId, userId);
    if (!workspace) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const files = await prisma.workspaceFile.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ files });
  } catch (err: any) {
    console.error("WORKSPACE FILES GET ERROR:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}

// POST - record a file that the browser already uploaded directly to Vercel
// Blob (see files/upload-token). This route never touches the file's bytes,
// only its resulting metadata/URL.
export async function POST(req: NextRequest, { params }: { params: Params }) {
  try {
    const { id: workspaceId } = await params;
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const workspace = await requireMembership(workspaceId, userId);
    if (!workspace) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json().catch(() => null);
    if (!body?.url || !body?.filename) {
      return NextResponse.json({ error: "Missing url or filename" }, { status: 400 });
    }

    const file = await prisma.workspaceFile.create({
      data: {
        workspaceId,
        filename: String(body.filename),
        mimeType: String(body.mimeType || "application/octet-stream"),
        size: Number(body.size) || 0,
        url: String(body.url),
        storage: "vercel-blob",
      },
    });

    return NextResponse.json({ file }, { status: 201 });
  } catch (err: any) {
    console.error("WORKSPACE FILES POST ERROR:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
