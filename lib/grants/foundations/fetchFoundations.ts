import axios from "axios";

export async function fetchFoundations() {
  // ⭐ Placeholder API endpoints — replace with real 990-PF sources later
  const urls = [
    "https://api.example-foundations.org/foundations",
    "https://api.example-philanthropy.org/data",
  ];

  const results: any[] = [];

  for (const url of urls) {
    try {
      const res = await axios.get(url);
      if (Array.isArray(res.data)) {
        results.push(...res.data);
      } else if (res.data?.foundations) {
        results.push(...res.data.foundations);
      }
    } catch (err) {
      console.error("Foundation fetch error:", err);
    }
  }

  return results;
}
