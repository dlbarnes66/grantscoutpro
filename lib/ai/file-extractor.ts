/**
 * Universal file extractor for Workspace/User/Document files.
 *
 * Supports:
 * - PDF
 * - DOCX
 * - TXT
 * - Markdown
 * - HTML
 *
 * Output:
 * - Clean text string for embeddings, search, clustering, and RAG.
 */

import { prisma } from "@/lib/prisma";
import pdfParse from "pdf-parse";
import { Document as DocxDocument, Packer } from "docx";

/**
 * Downloads a file from its URL.
 * Works with:
 * - Local storage
 * - S3
 * - GCS
 * - Any HTTP-accessible storage
 */
async function fetchFileBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Failed to download file: ${url}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Extracts text from PDF files.
 */
async function extractPdf(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);
    return cleanText(data.text || "");
  } catch (err) {
    console.error("PDF extraction error:", err);
    return "";
  }
}

/**
 * Extracts text from DOCX files.
 */
async function extractDocx(buffer: Buffer): Promise<string> {
  try {
    const doc = await DocxDocument.load(buffer);
    const text = doc.getText();
    return cleanText(text || "");
  } catch (err) {
    console.error("DOCX extraction error:", err);
    return "";
  }
}

/**
 * Extracts text from TXT files.
 */
function extractTxt(buffer: Buffer): string {
  return cleanText(buffer.toString("utf-8"));
}

/**
 * Extracts text from Markdown files.
 * Strips markdown formatting.
 */
function extractMarkdown(buffer: Buffer): string {
  const raw = buffer.toString("utf-8");

  return cleanText(
    raw
      .replace(/[#_*`~>-]/g, " ")
      .replace(/`\(⁠(.*?)\)``\(⁠(.*?)\)`/g, "$1")
      .replace(/\s+/g, " ")
  );
}

/**
 * Extracts text from HTML files.
 */
function extractHtml(buffer: Buffer): string {
  const raw = buffer.toString("utf-8");
  return cleanText(raw.replace(/<[^>]+>/g, " "));
}

/**
 * Main extractor entry point.
 *
 * Given a fileId, returns clean extracted text.
 */
export async function extractFileContent(fileId: string): Promise<string> {
  const file = await prisma.file.findUnique({
    where: { id: fileId },
  });

  if (!file) {
    throw new Error(`File not found: ${fileId}`);
  }

  const { url, mimeType } = file;

  if (!url || !mimeType) {
    return "";
  }

  const buffer = await fetchFileBuffer(url);

  if (mimeType.includes("pdf")) {
    return await extractPdf(buffer);
  }

  if (mimeType.includes("word") || mimeType.includes("docx")) {
    return await extractDocx(buffer);
  }

  if (mimeType.includes("text/plain")) {
    return extractTxt(buffer);
  }

  if (mimeType.includes("markdown") || mimeType.includes("md")) {
    return extractMarkdown(buffer);
  }

  if (mimeType.includes("html")) {
    return extractHtml(buffer);
  }

  // Unsupported formats return empty text
  return "";
}

/**
 * Cleans extracted text.
 */
function cleanText(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/\n+/g, " ")
    .trim();
}
