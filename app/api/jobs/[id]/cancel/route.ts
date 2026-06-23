import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.job.update({
      where: { id: params.id },
      data: { status: "cancelled" },
    });

    return new Response(JSON.stringify({ message: "Job cancelled" }), { status: 200 });
  } catch (error) {
    console.error("Error cancelling job:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
