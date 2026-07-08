/**
 * Universal content extractor for Document.content (Json?).
 *
 * Supports:
 * - TipTap JSON
 * - Slate JSON
 * - Lexical JSON
 * - Quill Delta
 * - Plain text
 * - HTML
 * - Mixed formats
 * - AI-generated JSON
 *
 * Output:
 * - Clean text string for embeddings, search, clustering, and RAG.
 */

export function extractContent(content: any): string {
  if (!content) return "";

  // 1. If content is a plain string
  if (typeof content === "string") {
    return cleanText(content);
  }

  // 2. If content is HTML stored as JSON
  if (typeof content === "object" && content.html) {
    return cleanText(stripHtml(content.html));
  }

  // 3. TipTap format: { type: "doc", content: [...] }
  if (isTipTap(content)) {
    return cleanText(extractTipTap(content));
  }

  // 4. Slate format: array of nodes
  if (isSlate(content)) {
    return cleanText(extractSlate(content));
  }

  // 5. Lexical format: { root: { children: [...] } }
  if (isLexical(content)) {
    return cleanText(extractLexical(content));
  }

  // 6. Quill Delta: { ops: [...] }
  if (isQuill(content)) {
    return cleanText(extractQuill(content));
  }

  // 7. Generic JSON fallback
  return cleanText(JSON.stringify(content));
}

/* -------------------------------------------------------
 *  TipTap Extractor
 * ----------------------------------------------------- */

function isTipTap(json: any): boolean {
  return json && json.type === "doc" && Array.isArray(json.content);
}

function extractTipTap(node: any): string {
  if (!node) return "";

  if (typeof node === "string") return node;

  if (Array.isArray(node)) {
    return node.map(extractTipTap).join(" ");
  }

  if (node.text) return node.text;

  if (node.content) {
    return node.content.map(extractTipTap).join(" ");
  }

  return "";
}

/* -------------------------------------------------------
 *  Slate Extractor
 * ----------------------------------------------------- */

function isSlate(json: any): boolean {
  return Array.isArray(json) && json.every((n) => typeof n === "object");
}

function extractSlate(nodes: any[]): string {
  return nodes
    .map((node) => {
      if (node.text) return node.text;
      if (Array.isArray(node.children)) return extractSlate(node.children);
      return "";
    })
    .join(" ");
}

/* -------------------------------------------------------
 *  Lexical Extractor
 * ----------------------------------------------------- */

function isLexical(json: any): boolean {
  return json && json.root && Array.isArray(json.root.children);
}

function extractLexical(json: any): string {
  const walk = (node: any): string => {
    if (!node) return "";
    if (node.text) return node.text;
    if (Array.isArray(node.children)) {
      return node.children.map(walk).join(" ");
    }
    return "";
  };

  return walk(json.root);
}

/* -------------------------------------------------------
 *  Quill Extractor
 * ----------------------------------------------------- */

function isQuill(json: any): boolean {
  return json && Array.isArray(json.ops);
}

function extractQuill(delta: any): string {
  return delta.ops
    .map((op: any) => {
      if (typeof op.insert === "string") return op.insert;
      return "";
    })
    .join(" ");
}

/* -------------------------------------------------------
 *  HTML Stripper
 * ----------------------------------------------------- */

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ");
}

/* -------------------------------------------------------
 *  Text Cleaner
 * ----------------------------------------------------- */

function cleanText(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/\n+/g, " ")
    .trim();
}
