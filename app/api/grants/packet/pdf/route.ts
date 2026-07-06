import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import PDFDocument from "pdfkit";

export async function GET(req, { params }) {
  try {
    const { grantId } = params;

    const grant = await prisma.grant.findUnique({
      where: { id: grantId },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        agency: true,
        summary: true,
        amount: true,
        deadline: true,
        industry: true,
        location: true,
        fundingRange: true,
        status: true,
        createdAt: true,
        updatedAt: true,

        // ⭐ REQUIRED — fixes the "never" error
        GrantSection: {
          select: {
            id: true,
            title: true,
            content: true,
            order: true
          },
          orderBy: { order: "asc" }
        }
      }
    });

    if (!grant) {
      return NextResponse.json(
        { success: false, error: "Grant not found" },
        { status: 404 }
      );
    }

    const doc = new PDFDocument();
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => {});

    const write = (text, size = 12) => {
      doc.fontSize(size).text(text);
      doc.moveDown();
    };

    write(`Grant Packet: ${grant.title}`, 20);
    write(`Category: ${grant.category}`);
    write(`Agency: ${grant.agency}`);
    write(`Summary: ${grant.summary}`);
    write(`Industry: ${grant.industry}`);
    write(`Location: ${grant.location}`);
    write(`Funding Range: ${grant.fundingRange}`);
    write(`Deadline: ${grant.deadline}`);
    write("--- Narrative ---", 16);

    // ⭐ FIXED — use grant.GrantSection instead of grant.sections
    for (const section of grant.GrantSection) {
      write(section.title, 14);

      const lines = section.content.split("\n");
      for (const line of lines) {
        write(line, 12);
      }

      doc.moveDown();
    }

    doc.end();

    const pdfBuffer = Buffer.concat(chunks);

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="grant_${grantId}.pdf"`
      }
    });
  } catch (error) {
    console.error("PACKET PDF ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate PDF packet" },
      { status: 500 }
    );
  }
}
