import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const docId = searchParams.get("docId");

  if (!docId) {
    return new Response("Missing docId", { status: 400 });
  }

  let lastCheck = new Date();

  const stream = new ReadableStream({
    async start(controller) {
      async function poll() {
        const patches = await prisma.documentPatch.findMany({
          where: {
            docId,
            createdAt: { gt: lastCheck },
          },
          orderBy: { createdAt: "asc" },
        });

        lastCheck = new Date();

        if (patches.length > 0) {
          controller.enqueue(`data: ${JSON.stringify(patches)}\n\n`);
        }

        setTimeout(poll, 1200);
      }

      poll();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
