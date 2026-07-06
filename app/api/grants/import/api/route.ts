import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const { data, workspaceId } = await req.json();

    if (!workspaceId) {
      return NextResponse.json(
        { success: false, error: "workspaceId is required" },
        { status: 400 }
      );
    }

    for (const grant of data) {
      await prisma.grant.create({
        data: {
          title: grant.title,
          description: grant.description,
          category: grant.category,
          deadline: new Date(grant.deadline),
          industry: grant.industry ?? "",
          location: grant.location ?? "",
          fundingRange: grant.fundingRange ?? "",
          workspace: { connect: { id: workspaceId } } // ⭐ REQUIRED
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("IMPORT GRANTS ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to import grants" },
      { status: 500 }
    );
  }
}
