export function extractContent(json: unknown): string {
  try {
    // If already a string
    if (typeof json === "string") return json;

    // If object with a content field
    if (
      typeof json === "object" &&
      json !== null &&
      "content" in json
    ) {
      const value = (json as { content: unknown }).content;
      return typeof value === "string"
        ? value
        : JSON.stringify(value);
    }

    // Generic fallback
    return JSON.stringify(json);
  } catch {
    return "";
  }
}
