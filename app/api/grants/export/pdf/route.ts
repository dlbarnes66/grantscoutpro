import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import PDFDocument from "pdfkit";
import { Readable } from "stream";

export async function POST(req: Request) {
  try {
    const { grantId } = await req.json();

    const grant = await prisma.grant.findUnique({
      where: { id: grantId },
      select: {
        title: true,
        summary: true
      }
    });

    const sections = await prisma.grantSection.findMany({
      where: { grantId },
      orderBy: { order: "asc" },
      select: {
        title: true,
        content: true
      }
    });

    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    const stream = doc.on("data", (chunk) => {
      chunks.push(chunk as Buffer);
    }).on("end", () => {});

    // Title
    doc.fontSize(20).text(grant?.title || "Grant Narrative", { underline: true });
    doc.moveDown();

    // Summary
    if (grant?.summary) {
      doc.fontSize(12).text(grant.summary);
      doc.moveDown();
    }

    // Sections
    sections.forEach((section) => {
      doc.fontSize(16).text(section.title, { underline: true });
      doc.moveDown();
      doc.fontSize(12).text(section.content || "", {
        align: "left"
      });
      doc.moveDown();
    });

    doc.end();

    await new Promise((resolve) => {
      (stream as Readable).on("end", resolve);
    });

    const pdfBuffer = Buffer.concat(chunks);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="grant-${grantId}.pdf"`
      }
    });
  } catch (error) {
    console.error("Grant PDF Export Error:", error);
    return NextResponse.json(
      { error: "Failed to export grant PDF" },
      { status: 500 }
    );
  }
}
