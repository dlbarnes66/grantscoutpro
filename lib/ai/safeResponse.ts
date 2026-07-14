export function safeResponse(parsed: any, fallbackKey: string) {
  if (!parsed || typeof parsed !== "object") {
    return {
      [fallbackKey]: {
        overallScore: 0,
        sections: [],
        globalRecommendations: []
      },
      output: null,
      error: "Invalid AI response"
    };
  }

  return parsed;
}
