import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// FIX: Force CommonJS version of pdf-parse
// @ts-ignore
const pdfParse = require("pdf-parse");

// FIX: Mammoth import (CommonJS)
const mammoth = require("mammoth");

import { writeFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.workspaceId) {
      return NextResponse.json(
        { error: "Unauthorized: No workspace found in session" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const workspaceId = session.user.workspaceId;

    // Save file temporarily
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const tempPath = path.join("/tmp", `${Date.now()}-${file.name}`);
    await writeFile(tempPath, buffer);

    let extractedText = "";

    // FIX: pdfParse is now callable
    if (file.name.endsWith(".pdf")) {
      const data = await pdfParse(buffer);
      extractedText = data.text;
    }

    // FIX: Mammoth CommonJS usage
    else if (file.name.endsWith(".docx")) {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    }

    else {
      return NextResponse.json(
        { error: "Unsupported file type. Upload PDF or DOCX." },
        { status: 400 }
      );
    }

    if (!extractedText.trim()) {
      return NextResponse.json(
        { error: "Could not extract text from document" },
        { status: 400 }
      );
    }

    // Save document
    const doc = await prisma.workspaceDocument.create({
      data: {
        workspaceId,
        title: file.name.replace(/\.(pdf|docx)$/i, ""),
        summary: extractedText.slice(0, 300),
        content: extractedText,
      },
    });

    return NextResponse.json({
      ok: true,
      documentId: doc.id,
    });
  } catch (err) {
    console.error("Document upload error:", err);
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    );
  }
}
