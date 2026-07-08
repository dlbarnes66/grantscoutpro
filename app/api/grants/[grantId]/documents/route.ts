import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { grantId: string } }
) {
  try {
    const grantId = params.grantId;

    const documents = await prisma.grantDocument.findMany({
      where: { grantId },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Document Load Error:", error);
    return NextResponse.json(
      { error: "Failed to load documents" },
      { status: 500 }
    );
  }
}
