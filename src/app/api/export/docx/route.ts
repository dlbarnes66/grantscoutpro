export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Document, Packer, Paragraph, TextRun } from "docx";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, content } = await req.json();

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [new TextRun({ text: title, bold: true, size: 32 })],
          }),
          new Paragraph({ children: [] }),
          ...content.split("\n").map(
            (line: string) =>
              new Paragraph({
                children: [new TextRun({ text: line, size: 24 })],
              })
          ),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${title}.docx"`,
    },
  });
}
