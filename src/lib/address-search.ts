export interface AddressSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  distance?: number;
}
export function belgianSuggestions(payload: unknown): AddressSuggestion[] {
  if (!Array.isArray(payload)) return [];
  return payload.filter((s) => s && typeof s.display_name === "string" && s.address?.country_code?.toLowerCase() === "be" &&
    typeof s.lat === "string" && typeof s.lon === "string" && s.lat.trim() !== "" && s.lon.trim() !== "" &&
    Number.isFinite(Number(s.lat)) && Number.isFinite(Number(s.lon)) && Math.abs(Number(s.lat)) <= 90 && Math.abs(Number(s.lon)) <= 180)
    .map(({ display_name, lat, lon }) => ({ display_name, lat, lon }));
}
export function sortByDistance(suggestions: AddressSuggestion[], point?: {lat:number;lon:number} | null): AddressSuggestion[] {
  if (!point || !Number.isFinite(point.lat) || !Number.isFinite(point.lon)) return suggestions;
  const radians = (v: number) => v * Math.PI / 180;
  return suggestions.map(s => {
    const lat = Number(s.lat), lon = Number(s.lon);
    const a = Math.sin(radians(lat - point.lat) / 2) ** 2 + Math.cos(radians(point.lat)) * Math.cos(radians(lat)) * Math.sin(radians(lon - point.lon) / 2) ** 2;
    return { ...s, distance: 6371 * 2 * Math.asin(Math.sqrt(Math.min(1, Math.max(0, a)))) };
  }).sort((a,b) => a.distance - b.distance);
}
