import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req, { params }) {
  const { id } = params;

  try {
    const logs = await prisma.jobLog.findMany({
      where: { jobId: id },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(logs, { status: 200 });
  } catch (error) {
    console.error("Error fetching logs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
