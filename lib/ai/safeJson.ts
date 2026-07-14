export function safeJson(input: string) {
  try {
    return JSON.parse(input);
  } catch {
    // Attempt to extract JSON from messy AI output
    const match = input.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return { error: "Malformed JSON", raw: input };
      }
    }

    return { error: "No JSON found", raw: input };
  }
}
