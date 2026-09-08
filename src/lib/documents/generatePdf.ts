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

export type PackageSection = { title: string; content: string };
export type PackageBudgetLineItem = { category: string; description: string; amount: number };

function formatCurrency(n: number): string {
  return `$${n.toLocaleString("en-US")}`;
}

/**
 * A multi-section submission package: grant header, each AI-drafted
 * proposal section, then a budget table - the "Download Package PDF"
 * output for the AI-assisted submission-package flow (see
 * src/lib/ai/proposalPackage.ts and budgetBuilder.ts). Reuses the same
 * page/wrap machinery as generateDocumentPdf below rather than a second
 * copy of it.
 */
export async function generatePackagePdf(
  grantTitle: string,
  sections: PackageSection[],
  budget: { lineItems: PackageBudgetLineItem[]; total: number; notes: string } | null
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);

  pdf.setTitle(`Submission Package - ${grantTitle}`);

  let page: PDFPage = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  function newPage() {
    page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    y = PAGE_HEIGHT - MARGIN;
  }
  function ensureSpace(need: number) {
    if (y - need < MARGIN) newPage();
  }
  function drawHeading(text: string, size: number) {
    for (const line of wrapLine(text, boldFont, size, CONTENT_WIDTH)) {
      ensureSpace(size * 1.3);
      page.drawText(line, { x: MARGIN, y, size, font: boldFont, color: rgb(0.05, 0.1, 0.2) });
      y -= size * 1.3;
    }
  }
  function drawParagraphs(text: string) {
    for (const paragraph of (text || "").split(/\n\s*\n/)) {
      for (const rawLine of paragraph.split("\n")) {
        for (const line of wrapLine(rawLine, font, BODY_SIZE, CONTENT_WIDTH)) {
          ensureSpace(LINE_HEIGHT);
          page.drawText(line, { x: MARGIN, y, size: BODY_SIZE, font, color: rgb(0.1, 0.1, 0.1) });
          y -= LINE_HEIGHT;
        }
      }
      y -= LINE_HEIGHT * 0.6;
    }
  }

  drawHeading(`Submission Package: ${grantTitle}`, TITLE_SIZE);
  y -= 6;

  for (const section of sections) {
    ensureSpace(LINE_HEIGHT * 3);
    drawHeading(section.title, 14);
    drawParagraphs(section.content);
    y -= 6;
  }

  if (budget && budget.lineItems.length > 0) {
    ensureSpace(LINE_HEIGHT * 3);
    drawHeading("Budget", 14);
    for (const item of budget.lineItems) {
      ensureSpace(LINE_HEIGHT);
      const line = `${item.category} - ${item.description}`.trim();
      const lines = wrapLine(line, font, BODY_SIZE, CONTENT_WIDTH - 80);
      for (const l of lines) {
        ensureSpace(LINE_HEIGHT);
        page.drawText(l, { x: MARGIN, y, size: BODY_SIZE, font, color: rgb(0.1, 0.1, 0.1) });
        y -= LINE_HEIGHT;
      }
      page.drawText(formatCurrency(item.amount), {
        x: PAGE_WIDTH - MARGIN - 70,
        y: y + LINE_HEIGHT,
        size: BODY_SIZE,
        font: boldFont,
        color: rgb(0.05, 0.1, 0.2),
      });
    }
    y -= 4;
    ensureSpace(LINE_HEIGHT * 1.5);
    page.drawText(`Total: ${formatCurrency(budget.total)}`, {
      x: MARGIN,
      y,
      size: 12,
      font: boldFont,
      color: rgb(0.05, 0.1, 0.2),
    });
    y -= LINE_HEIGHT * 1.5;
    if (budget.notes) drawParagraphs(budget.notes);
  }

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
