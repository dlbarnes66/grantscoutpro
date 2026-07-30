import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ grantId: string }> }
) {
  try {
    const { grantId } = await context.params;

    const form = await req.formData();
    const nodeForm = form as unknown as import("undici").FormData;

    const file = nodeForm.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create GrantDocument (schema only allows filename + url)
    const grantDocument = await prisma.grantDocument.create({
      data: {
        grantId,
        filename: file.name,
        url: `/uploads/${file.name}` // replace with your actual storage path
      }
    });

    return NextResponse.json({
      success: true,
      document: grantDocument
    });
  } catch (err: any) {
    console.error("GRANT DOCUMENT UPLOAD ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
