export async function fetchOpportunityZoneStatus(location) {
  try {
    if (!location.zip) return { isOZ: false };

    const url =
      "https://raw.githubusercontent.com/OpportunityZones/OZ-Data/master/oz.csv";

    const res = await fetch(url);
    const text = await res.text();
    const lines = text.split("\n");

    for (const line of lines) {
      const parts = line.split(",");

      const tractZip = parts[3]; // ZIP code column

      if (tractZip === location.zip) {
        return { isOZ: true };
      }
    }

    return { isOZ: false };
  } catch (err) {
    console.error("Opportunity Zone lookup error:", err);
    return { isOZ: false };
  }
}
