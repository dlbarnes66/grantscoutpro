/**
 * Writer client for calling all writer API routes from the frontend.
 */

export type WriterTool =
  | "rewrite"
  | "expand"
  | "summarize"
  | "improve"
  | "clarify"
  | "shorten"
  | "tone"
  | "budget-justification"
  | "compliance"
  | "full-proposal"
  | "narrative"
  | "revision"
  | "section"
  | "tone-style";

interface WriterClientInput {
  workspaceId: string;
  documentId: string;
  prompt: string;
  tool: WriterTool;
}

interface WriterClientOutput {
  output: string;
}

/**
 * Maps writer tools to their API route paths.
 */
const ROUTE_MAP: Record<WriterTool, string> = {
  rewrite: "/api/writer/rewrite",
  expand: "/api/writer/expand",
  summarize: "/api/writer/summarize",
  improve: "/api/writer/improve",
  clarify: "/api/writer/clarify",
  shorten: "/api/writer/shorten",
  tone: "/api/writer/tone-style",

  "budget-justification": "/api/writer/budget-justification",
  compliance: "/api/writer/compliance",
  "full-proposal": "/api/writer/full-proposal",
  narrative: "/api/writer/narrative",
  revision: "/api/writer/revision",
  section: "/api/writer/section",
  "tone-style": "/api/writer/tone-style"
};

/**
 * Unified writer client.
 */
export async function writerClient(
  input: WriterClientInput
): Promise<WriterClientOutput> {
  const { workspaceId, documentId, prompt, tool } = input;

  const route = ROUTE_MAP[tool];

  const res = await fetch(route, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      workspaceId,
      documentId,
      prompt
    })
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error ?? "Writer request failed");
  }

  const data = (await res.json()) as WriterClientOutput;
  return data;
}
