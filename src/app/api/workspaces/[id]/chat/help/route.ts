import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimit";
import { generateHelpReply, type ChatMessage } from "@/lib/ai/helpAssistant";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string };

const USER_LIMIT_PER_WINDOW = Number(process.env.HELP_CHAT_USER_LIMIT ?? 30);
const USER_LIMIT_WINDOW_SECONDS = 10 * 60;
const MAX_HISTORY_MESSAGES = 12;
const MAX_MESSAGE_LENGTH = 2000;

export async function POST(req: NextRequest, context: { params: Promise<Params> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = await context.params;

  const member = await prisma.workspaceMember.findFirst({
    where: { workspaceId: params.id, userId, status: "active" },
  });
  const workspace = await prisma.workspace.findUnique({
    where: { id: params.id },
    select: { ownerId: true },
  });
  if (!member && workspace?.ownerId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rl = await checkRateLimit(`chat:help:user:${userId}`, USER_LIMIT_PER_WINDOW, USER_LIMIT_WINDOW_SECONDS);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many messages - please wait a bit before sending another." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const rawMessages = Array.isArray(body.messages) ? body.messages : [];
  const page = typeof body.page === "string" ? body.page : undefined;

  const messages: ChatMessage[] = rawMessages
    .filter(
      (m: any) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0
    )
    .slice(-MAX_HISTORY_MESSAGES)
    .map((m: any) => ({
      role: m.role,
      content: m.content.slice(0, MAX_MESSAGE_LENGTH),
    }));

  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return NextResponse.json({ error: "A user message is required." }, { status: 400 });
  }

  const { reply } = await generateHelpReply(messages, page);
  return NextResponse.json({ reply });
}
