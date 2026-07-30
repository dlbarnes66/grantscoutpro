export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import PDFDocument from "pdfkit";
import { Readable } from "stream";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, content } = await req.json();

  const doc = new PDFDocument();
  const stream = doc.pipe(Readable.from([]));

  doc.fontSize(20).text(title, { underline: true });
  doc.moveDown();
  doc.fontSize(12).text(content);
  doc.end();

  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(chunk);
  const pdfBuffer = Buffer.concat(chunks);

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${title}.pdf"`,
    },
  });
}
