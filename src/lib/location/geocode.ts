export async function geocodeLocation(city, state, zip) {
  try {
    const query = [city, state, zip].filter(Boolean).join(" ");

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
    )}`;

    const res = await fetch(url);
    const json = await res.json();

    if (!json || json.length === 0) return null;

    return {
      lat: parseFloat(json[0].lat),
      lng: parseFloat(json[0].lon),
    };
  } catch (err) {
    console.error("Geocoding error:", err);
    return null;
  }
}
