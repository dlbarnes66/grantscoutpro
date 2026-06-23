import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(_, { params }) {
  const { id } = params;

  try {
    // Delete logs first (foreign key constraint)
    await prisma.jobLog.deleteMany({
      where: { jobId: id },
    });

    // Delete job
    await prisma.job.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete job error:", err);
    return NextResponse.json({ error: "Failed to delete job" }, { status: 500 });
  }
}
