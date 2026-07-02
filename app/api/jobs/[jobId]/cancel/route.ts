import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(_req, { params }) {
  const { id } = params;

  try {
    await prisma.job.update({
      where: { id },
      data: { status: "cancelled" },
    });

    return NextResponse.json({ message: "Job cancelled" }, { status: 200 });
  } catch (error) {
    console.error("Error cancelling job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
