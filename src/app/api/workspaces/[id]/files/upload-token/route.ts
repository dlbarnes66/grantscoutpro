import { auth } from "@clerk/nextjs/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = Promise<{ id: string }>;

const ALLOWED_CONTENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "text/plain",
  "image/png",
  "image/jpeg",
  "image/webp",
];

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB

// Issues a short-lived, workspace-scoped token that lets the browser upload
// a file straight to Vercel Blob storage (bypassing this route entirely for
// the actual file bytes, so a large PDF never has to fit inside a single
// serverless function's request body limit). The workspace membership check
// happens here, before any token is handed out - see
// src/hooks/useWorkspaceFiles.ts for the client side of this handshake.
export async function POST(req: NextRequest, { params }: { params: Params }) {
  try {
    const { id: workspaceId } = await params;
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { members: { where: { status: "active" } } },
    });
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }
    const isMember =
      workspace.ownerId === userId || workspace.members.some((m) => m.userId === userId);
    if (!isMember) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await req.json()) as HandleUploadBody;

    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          maximumSizeInBytes: MAX_FILE_SIZE_BYTES,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ workspaceId, userId }),
        };
      },
      onUploadCompleted: async () => {
        // Intentionally a no-op: this callback only fires when Vercel Blob
        // can reach a public URL back to this deployment, which doesn't
        // hold for preview/local environments. The WorkspaceFile row is
        // created from the client instead, right after upload() resolves
        // (see useWorkspaceFiles.addFile) - simpler to reason about and
        // works the same everywhere.
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (err: any) {
    console.error("WORKSPACE FILES UPLOAD-TOKEN ERROR:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 400 });
  }
}
