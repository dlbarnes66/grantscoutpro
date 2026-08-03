export function highlightMatch(content: string, query: string): string {
  // Normalize both strings
  const normalizedContent = content.toLowerCase();
  const normalizedQuery = query.toLowerCase();

  // Split query into individual words
  const words = normalizedQuery.split(/\s+/).filter(Boolean);

  let highlighted = content;

  // Highlight each word
  for (const word of words) {
    const regex = new RegExp(`(${escapeRegex(word)})`, "gi");
    highlighted = highlighted.replace(
      regex,
      `<mark class="bg-yellow-300">$1</mark>`
    );
  }

  return highlighted;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
