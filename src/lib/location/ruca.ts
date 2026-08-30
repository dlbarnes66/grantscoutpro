export async function fetchRuralUrbanCode(location) {
  try {
    if (!location.zip) {
      return { code: null };
    }

    const url = `https://www.ers.usda.gov/webdocs/DataFiles/53241/ruca2010revised.xlsx`;

    // RUCA data is not a JSON API — we use a hosted CSV mirror
    const csvUrl =
      "https://raw.githubusercontent.com/datadesk/us-ruca-codes/master/ruca-codes.csv";

    const res = await fetch(csvUrl);
    const text = await res.text();

    const lines = text.split("\n");

    for (const line of lines) {
      const parts = line.split(",");

      const zip = parts[0];
      const rucaCode = parseInt(parts[1]);

      if (zip === location.zip) {
        // RUCA code 1–3 = Urban
        // RUCA code 4–10 = Rural
        const code = rucaCode <= 3 ? "URBAN" : "RURAL";
        return { code };
      }
    }

    return { code: null };
  } catch (err) {
    console.error("RUCA lookup error:", err);
    return { code: null };
  }
}
