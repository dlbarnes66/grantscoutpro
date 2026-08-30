import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const subscribers = new Set<ReadableStreamDefaultController>();

function broadcast(event: any) {
  const data = `data: ${JSON.stringify(event)}\n\n`;
  for (const controller of subscribers) {
    controller.enqueue(new TextEncoder().encode(data));
  }
}

export async function GET(_req: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      subscribers.add(controller);

      // Send initial ping
      controller.enqueue(new TextEncoder().encode("data: connected\n\n"));
    },
    cancel(controller) {
      subscribers.delete(controller);
      controller.close();
    },
  });

  return new NextResponse(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

// Export broadcast so other routes can use it
export { broadcast };

