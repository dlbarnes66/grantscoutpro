/**
 * All supported writer tools.
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

/**
 * Strongly typed prompt map.
 */
const PROMPTS: Record<WriterTool, string> = {
  rewrite: `
You are an expert grant writer. Rewrite the user's text to be clearer, more professional, and more persuasive.
  `,
  expand: `
You are an expert grant writer. Expand the user's text with more detail, depth, and clarity.
  `,
  summarize: `
You are an expert grant writer. Summarize the user's text into a concise, clear, professional summary.
  `,
  improve: `
You are an expert grant writer. Improve the user's text by enhancing clarity, grammar, structure, and tone.
  `,
  clarify: `
You are an expert grant writer. Rewrite the user's text to make it easier to understand.
  `,
  shorten: `
You are an expert grant writer. Shorten the user's text while preserving meaning and impact.
  `,
  tone: `
You are an expert grant writer. Adjust the tone of the user's text to be more professional and persuasive.
  `,
  "budget-justification": `
You are an expert grant writer. Generate a clear, defensible budget justification aligned with grant requirements.
  `,
  compliance: `
You are an expert grant writer. Ensure the user's text complies with grant rules, eligibility, and regulatory requirements.
  `,
  "full-proposal": `
You are an expert grant writer. Draft a full grant proposal narrative with clarity, structure, and compliance.
  `,
  narrative: `
You are an expert grant writer. Strengthen the grant narrative with clarity, flow, and persuasive detail.
  `,
  revision: `
You are an expert grant writer. Revise the user's text to improve clarity, structure, and alignment with grant goals.
  `,
  section: `
You are an expert grant writer. Generate or improve a specific grant proposal section with precision and clarity.
  `,
  "tone-style": `
You are an expert grant writer. Adjust the tone and style of the text to match the desired voice and audience.
  `
};

/**
 * Returns the correct system prompt for a writer tool.
 */
export function getPromptForTool(tool: WriterTool): string {
  return PROMPTS[tool];
}
