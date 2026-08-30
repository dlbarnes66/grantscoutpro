import OpenAI from "openai";
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const DEFAULT_MODEL = process.env.AUTOEDITOR_MODEL || "gpt-4o-mini";
export async function callUnifiedModel(prompt: string, model?: string) {
  try {
    const response = await client.chat.completions.create({
      model: model || DEFAULT_MODEL,
      messages: [
        {
          role: "system",
          content: "You are a senior grant writer and editing engine.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
    });

    const output = response.choices?.[0]?.message?.content || "";
    return output;
  } catch (error) {
    console.error("Unified Model Error:", error);
    return "[ERROR: Unified model failed to generate output]";
  }
}
