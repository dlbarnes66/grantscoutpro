export async function fetchCensusData(location) {
  try {
    if (!location.zip || !location.state) {
      return {
        population: null,
        medianIncome: null,
        povertyRate: null,
        unemploymentRate: null,
      };
    }

    const state = location.state;
    const zip = location.zip;

    // Census API: ACS 5-year ZIP Code Tabulation Area (ZCTA)
    const url = `https://api.census.gov/data/2021/acs/acs5?get=B01003_001E,B19013_001E,B17001_002E,B17001_001E,DP03_0009E&for=zip%20code%20tabulation%20area:${zip}`;

    const res = await fetch(url);
    const json = await res.json();

    // First row is headers, second row is data
    const data = json[1];

    const population = parseInt(data[0]);
    const medianIncome = parseInt(data[1]);
    const povertyNumerator = parseInt(data[2]);
    const povertyDenominator = parseInt(data[3]);
    const unemploymentRate = parseFloat(data[4]);

    const povertyRate =
      povertyDenominator > 0
        ? (povertyNumerator / povertyDenominator) * 100
        : null;

    return {
      population,
      medianIncome,
      povertyRate,
      unemploymentRate,
    };
  } catch (err) {
    console.error("Census API error:", err);
    return {
      population: null,
      medianIncome: null,
      povertyRate: null,
      unemploymentRate: null,
    };
  }
}
