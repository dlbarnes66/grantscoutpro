/**
 * Universal content extractor for Document.content (Json?).
 */

export function extractContent(content: unknown): string {
  if (!content) return "";

  // 1. Plain string
  if (typeof content === "string") {
    return cleanText(content);
  }

  // 2. HTML stored as JSON
  if (
    typeof content === "object" &&
    content !== null &&
    "html" in content &&
    typeof (content as { html: unknown }).html === "string"
  ) {
    return cleanText(stripHtml((content as { html: string }).html));
  }

  // 3. TipTap
  if (isTipTap(content)) {
    return cleanText(extractTipTap(content));
  }

  // 4. Slate
  if (isSlate(content)) {
    return cleanText(extractSlate(content));
  }

  // 5. Lexical
  if (isLexical(content)) {
    return cleanText(extractLexical(content));
  }

  // 6. Quill
  if (isQuill(content)) {
    return cleanText(extractQuill(content));
  }

  // 7. Fallback
  return cleanText(JSON.stringify(content));
}

/* -------------------------------------------------------
 *  TipTap Extractor
 * ----------------------------------------------------- */

interface TipTapNode {
  type?: string;
  text?: string;
  content?: TipTapNode[];
}

function isTipTap(json: unknown): json is TipTapNode {
  return (
    typeof json === "object" &&
    json !== null &&
    (json as TipTapNode).type === "doc" &&
    Array.isArray((json as TipTapNode).content)
  );
}

function extractTipTap(node: unknown): string {
  if (!node) return "";

  if (typeof node === "string") return node;

  if (Array.isArray(node)) {
    return node.map(extractTipTap).join(" ");
  }

  const obj = node as TipTapNode;

  if (obj.text) return obj.text;

  if (Array.isArray(obj.content)) {
    return obj.content.map(extractTipTap).join(" ");
  }

  return "";
}

/* -------------------------------------------------------
 *  Slate Extractor
 * ----------------------------------------------------- */

interface SlateNode {
  text?: string;
  children?: SlateNode[];
}

function isSlate(json: unknown): json is SlateNode[] {
  return (
    Array.isArray(json) &&
    json.every((n) => typeof n === "object" && n !== null)
  );
}

function extractSlate(nodes: SlateNode[]): string {
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

interface LexicalNode {
  text?: string;
  children?: LexicalNode[];
}

interface LexicalRoot {
  root: {
    children: LexicalNode[];
  };
}

function isLexical(json: unknown): json is LexicalRoot {
  return (
    typeof json === "object" &&
    json !== null &&
    "root" in json &&
    Array.isArray((json as LexicalRoot).root.children)
  );
}

function extractLexical(json: LexicalRoot): string {
  const walk = (node: LexicalNode | undefined): string => {
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

interface QuillOp {
  insert?: unknown;
}

interface QuillDelta {
  ops: QuillOp[];
}

function isQuill(json: unknown): json is QuillDelta {
  return (
    typeof json === "object" &&
    json !== null &&
    Array.isArray((json as QuillDelta).ops)
  );
}

function extractQuill(delta: QuillDelta): string {
  return delta.ops
    .map((op) => {
      return typeof op.insert === "string" ? op.insert : "";
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
  return text.replace(/\s+/g, " ").replace(/\n+/g, " ").trim();
}
