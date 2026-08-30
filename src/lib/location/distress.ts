export async function fetchDistressStatus(location) {
  try {
    if (!location.zip) return { isDistressed: false };

    const url =
      "https://raw.githubusercontent.com/EconomicInnovationGroup/distressed-communities-index/master/dci.csv";

    const res = await fetch(url);
    const text = await res.text();
    const lines = text.split("\n");

    for (const line of lines) {
      const parts = line.split(",");

      const zip = parts[0];
      const distressScore = parseFloat(parts[5]); // Distress score column

      if (zip === location.zip) {
        return { isDistressed: distressScore >= 80 };
      }
    }

    return { isDistressed: false };
  } catch (err) {
    console.error("Distressed community lookup error:", err);
    return { isDistressed: false };
  }
}
