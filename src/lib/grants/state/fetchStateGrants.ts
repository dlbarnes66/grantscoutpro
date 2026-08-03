import axios from "axios";

export async function fetchStateGrants() {
  // ⭐ Example state-level API (replace with real feeds later)
  const urls = [
    "https://api.example-state.gov/grants",
    "https://api.example-state2.gov/opportunities",
  ];

  const results: any[] = [];

  for (const url of urls) {
    try {
      const res = await axios.get(url);
      if (Array.isArray(res.data)) {
        results.push(...res.data);
      } else if (res.data?.grants) {
        results.push(...res.data.grants);
      }
    } catch (err) {
      console.error("State grant fetch error:", err);
    }
  }

  return results;
}
