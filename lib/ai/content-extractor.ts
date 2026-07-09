export function extractContent(json: any): string {
  try {
    if (typeof json === "string") return json;
    if (json?.content) return JSON.stringify(json.content);
    return JSON.stringify(json);
  } catch {
    return "";
  }
}
