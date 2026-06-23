import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    // mark job as queued again
    await prisma.job.update({
      where: { id: params.id },
      data: { status: "queued" },
    });

    return new Response(JSON.stringify({ message: "Retry triggered" }), { status: 200 });
  } catch (error) {
    console.error("Error retrying job:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
