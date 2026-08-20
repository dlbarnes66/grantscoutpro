import { NextResponse } from "next/server";
import { Models } from "@/lib/models";
import { guardDocumentAccess, guardWorkspaceMember } from "@/lib/route-guard";

export async function GET(req, { params }) {
  try {
    const { workspaceId, documentId } = params;

    await guardDocumentAccess(workspaceId, documentId);

    const messages = await Models.DocumentMessage.findMany({
      where: { documentId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(messages);
  } catch (err) {
    console.error("Messages error:", err);
    return NextResponse.json({ error: "Failed to load messages." }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const { workspaceId, documentId } = params;

    const member = await guardWorkspaceMember(workspaceId);
    await guardDocumentAccess(workspaceId, documentId);

    const body = await req.json();
    const { message } = body;

    const msg = await Models.DocumentMessage.create({
      data: {
        documentId,
        userId: member.userId,
        message,
      },
    });

    return NextResponse.json(msg);
  } catch (err) {
    console.error("Message create error:", err);
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  }
}
