import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ "grant-temp": string }> }
) {
  try {
    const { "grant-temp": grantTempId } = await context.params;

    const formData = await req.formData();

    // Cast to Node's FormData so TS allows .get()
    const nodeForm = formData as unknown as import("undici").FormData;

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
        grantId: grantTempId,
        filename: file.name,
        url: `/uploads/${file.name}` // replace with your actual storage path
      }
    });

    return NextResponse.json({
      success: true,
      document: grantDocument
    });
  } catch (err: any) {
    console.error("GRANT TEMP DOCUMENT UPLOAD ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
