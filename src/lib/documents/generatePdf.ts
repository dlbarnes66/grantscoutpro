import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

// Plain-text PDF layout: document content in this app is stored as a
// plain string (src/lib/documents/getDocumentContent.ts /
// WorkspaceDocument.content), not rich HTML, so there's no markup to
// preserve - this just wraps paragraphs onto Letter-sized pages with a
// title header and page numbers. If document content ever becomes rich
// HTML, this would need a real HTML-to-PDF renderer instead.

const PAGE_WIDTH = 612; // US Letter, points
const PAGE_HEIGHT = 792;
const MARGIN = 54; // 0.75in
const BODY_SIZE = 11;
const TITLE_SIZE = 20;
const LINE_HEIGHT = BODY_SIZE * 1.4;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function wrapLine(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  if (text.trim().length === 0) return [""];

  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      // A single word longer than the line width still has to go
      // somewhere - place it on its own line rather than looping forever.
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function generateDocumentPdf(title: string, content: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);

  pdf.setTitle(title || "Untitled Document");

  let page: PDFPage = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  function newPage() {
    page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    y = PAGE_HEIGHT - MARGIN;
  }

  function ensureSpace(need: number) {
    if (y - need < MARGIN) newPage();
  }

  // Title
  const titleLines = wrapLine(title || "Untitled Document", boldFont, TITLE_SIZE, CONTENT_WIDTH);
  for (const line of titleLines) {
    ensureSpace(TITLE_SIZE * 1.3);
    page.drawText(line, { x: MARGIN, y, size: TITLE_SIZE, font: boldFont, color: rgb(0.05, 0.1, 0.2) });
    y -= TITLE_SIZE * 1.3;
  }
  y -= 10;

  // Body - paragraphs separated by blank lines
  const paragraphs = (content || "").split(/\n\s*\n/);
  for (const paragraph of paragraphs) {
    const rawLines = paragraph.split("\n");
    for (const rawLine of rawLines) {
      const lines = wrapLine(rawLine, font, BODY_SIZE, CONTENT_WIDTH);
      for (const line of lines) {
        ensureSpace(LINE_HEIGHT);
        page.drawText(line, { x: MARGIN, y, size: BODY_SIZE, font, color: rgb(0.1, 0.1, 0.1) });
        y -= LINE_HEIGHT;
      }
    }
    y -= LINE_HEIGHT * 0.6; // paragraph spacing
  }

  // Page numbers, added last so we know the final count
  const pages = pdf.getPages();
  pages.forEach((p, i) => {
    p.drawText(`${i + 1} / ${pages.length}`, {
      x: PAGE_WIDTH - MARGIN - 40,
      y: MARGIN / 2,
      size: 9,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
  });

  return pdf.save();
}
