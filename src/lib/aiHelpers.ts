export async function aiGenerate(prompt: string) {
  await new Promise((r) => setTimeout(r, 300));
  return `AI Response: ${prompt.slice(0, 50)}...`;
}

export async function aiSummarize(text: string) {
  await new Promise((r) => setTimeout(r, 300));
  return `Summary: ${text.slice(0, 50)}...`;
}
