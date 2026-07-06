import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { applicationId } = await req.json();

    if (!applicationId) {
      return NextResponse.json(
        { error: "Missing applicationId" },
        { status: 400 }
      );
    }

    let lastCheck = new Date();

    const stream = new ReadableStream({
      async start(controller) {
        async function poll() {
          const edits = await prisma.applicationHistory.findMany({
            where: {
              grantId: applicationId,
              createdAt: { gt: lastCheck },
            },
            orderBy: { createdAt: "asc" },
          });

          if (edits.length > 0) {
            controller.enqueue(JSON.stringify(edits));
            lastCheck = new Date();
          }

          setTimeout(poll, 1000);
        }

        poll();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err: any) {
    console.error("Collab stream error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
