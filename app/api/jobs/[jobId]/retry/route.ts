import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(_req, { params }) {
  const { id } = params;

  try {
    // Mark job as queued again
    await prisma.job.update({
      where: { id },
      data: { status: "queued" },
    });

    return NextResponse.json(
      { message: "Retry triggered" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrying job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
