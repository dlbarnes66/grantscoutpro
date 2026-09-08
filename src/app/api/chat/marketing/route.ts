import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { generateMarketingReply, type ChatMessage } from "@/lib/ai/marketingAssistant";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Public, unauthenticated endpoint (marketing visitors aren't signed in),
// so it's the one AI route in the app with no Clerk membership check
// guarding it. Per-IP rate limiting is the substitute - without it,
// anyone could hammer this and run up the OpenAI bill. The global
// "openai:global" limiter inside generateMarketingReply is still applied
// on top as a shared safety net across every AI feature in the app.
const IP_LIMIT_PER_WINDOW = Number(process.env.MARKETING_CHAT_IP_LIMIT ?? 20);
const IP_LIMIT_WINDOW_SECONDS = 10 * 60;
const MAX_HISTORY_MESSAGES = 12;
const MAX_MESSAGE_LENGTH = 2000;

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = await checkRateLimit(`chat:marketing:ip:${ip}`, IP_LIMIT_PER_WINDOW, IP_LIMIT_WINDOW_SECONDS);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many messages - please wait a bit before sending another." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const rawMessages = Array.isArray(body.messages) ? body.messages : [];

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

  const { reply } = await generateMarketingReply(messages);
  return NextResponse.json({ reply });
}
