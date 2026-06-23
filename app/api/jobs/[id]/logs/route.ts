import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const logs = await prisma.jobLog.findMany({
      where: { jobId: params.id },
      orderBy: { createdAt: "asc" },
    });

    return new Response(JSON.stringify(logs), { status: 200 });
  } catch (error) {
    console.error("Error fetching logs:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
