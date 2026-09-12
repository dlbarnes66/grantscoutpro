import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardAIRequest } from "@/lib/ai/guardAIRequest";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string };

const MAX_DOCUMENTS_SCANNED = 50;
const MAX_SOURCE_DOCUMENTS = 5;
const MAX_EXCERPT_CHARS = 3000;
const MAX_HISTORY_MESSAGES = 8;

interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

// Keyword-overlap retrieval. There's no real embedding model wired up yet
// (src/lib/ai/embeddings.ts is a documented placeholder that returns
// random vectors), so a cosine-similarity search here would rank
// documents no better than chance. Plain keyword overlap against each
// document's title/content is worse than real semantic search, but it's
// honest about what it can find and works today without an embeddings
// provider.
function scoreDocument(queryWords: string[], title: string, content: string): number {
  const haystack = `${title}\n${content}`.toLowerCase();
  let score = 0;
  for (const word of queryWords) {
    if (!word) continue;
    const matches = haystack.split(word).length - 1;
    score += matches;
  }
  return score;
}

export async function POST(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<Params> }
) {
  const params = await paramsPromise;
  const { userId } = await auth();

  const guardResponse = await guardAIRequest(params.id, userId);
  if (guardResponse) return guardResponse;

  try {
    const body = await req.json().catch(() => ({}));
    const query = typeof body?.query === "string" ? body.query.trim() : "";
    const history: ChatTurn[] = Array.isArray(body?.history)
      ? body.history
          .filter((m: any) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
          .slice(-MAX_HISTORY_MESSAGES)
      : [];

    if (!query) {
      return NextResponse.json({ error: "query is required." }, { status: 400 });
    }

    const documents = await prisma.workspaceDocument.findMany({
      where: { workspaceId: params.id },
      orderBy: { updatedAt: "desc" },
      take: MAX_DOCUMENTS_SCANNED,
      select: { id: true, title: true, content: true, updatedAt: true },
    });

    const queryWords = query
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 2);

    const ranked = documents
      .map((doc) => ({
        doc,
        score: scoreDocument(queryWords, doc.title, doc.content || ""),
      }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_SOURCE_DOCUMENTS);

    const sources = ranked.map((r) => ({ id: r.doc.id, title: r.doc.title }));

    const contextBlock = ranked.length
      ? ranked
          .map(
            (r, i) =>
              `[Document ${i + 1}: "${r.doc.title}"]\n${(r.doc.content || "").slice(0, MAX_EXCERPT_CHARS)}`
          )
          .join("\n\n---\n\n")
      : "(No workspace documents matched this question by keyword. Say so plainly rather than guessing.)";

    const historyBlock = history.length
      ? history.map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n")
      : "(no prior turns)";

    const prompt = `
You are answering questions about a specific grant-writing workspace's own documents. Only use the excerpts below - if they don't contain the answer, say you couldn't find it in the workspace's documents rather than making something up.

Conversation so far:
${historyBlock}

Relevant document excerpts:
${contextBlock}

New question:
${query}

Answer in plain text (no markdown headers, no JSON) in a few clear sentences.
`;

    const answer = await callUnifiedModel(prompt);

    return NextResponse.json({ success: true, answer, sources });
  } catch (err: any) {
    console.error("WORKSPACE AI RAG ERROR:", err);
    return NextResponse.json({ error: err.message || "Failed to answer." }, { status: 500 });
  }
}
