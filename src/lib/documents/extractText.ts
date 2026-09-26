// Pulls plain text out of a funder's uploaded application document, for
// the "answer this funder's real questions" assistant
// (src/lib/ai/applicationAssistant.ts). Nothing else in the app reads
// PDF/DOCX content today - the existing document upload
// (workspaces/[id]/documents/upload) only handles plain text files.
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

const MAX_CHARS = 20_000;

export class UnsupportedFileTypeError extends Error {}

export async function extractTextFromFile(file: File): Promise<string> {
  const name = (file.name || "").toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());

  let text: string;

  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    const parsed = await pdfParse(buffer);
    text = parsed.text;
  } else if (
    name.endsWith(".docx") ||
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    text = result.value;
  } else if (name.endsWith(".txt") || name.endsWith(".md") || file.type.startsWith("text/")) {
    text = buffer.toString("utf8");
  } else {
    throw new UnsupportedFileTypeError(
      "Unsupported file type - upload a .pdf, .docx, or .txt file, or paste the questions as text instead."
    );
  }

  text = text.trim();
  if (!text) {
    throw new Error("Couldn't find any readable text in that file.");
  }

  return text.slice(0, MAX_CHARS);
}

export { MAX_CHARS as EXTRACT_TEXT_MAX_CHARS };
