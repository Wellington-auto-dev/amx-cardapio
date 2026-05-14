const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY as string;

/**
 * Converte um endereço em coordenadas lat/lng via Google Geocoding API.
 * Retorna null se não encontrado ou em caso de erro.
 */
export async function geocodeEndereco(
  endereco: string,
): Promise<{ lat: number; lng: number } | null> {
  try {
    const url =
      `https://maps.googleapis.com/maps/api/geocode/json` +
      `?address=${encodeURIComponent(endereco)}&key=${MAPS_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === 'OK' && data.results?.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      return { lat, lng };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Calcula a distância real pelo trajeto entre um ponto de origem (lat/lng)
 * e um endereço de destino via Google Distance Matrix API.
 * Retorna a distância em KM ou null em caso de erro.
 */
export async function calcularDistanciaKm(
  origemLat: number,
  origemLng: number,
  destinoEndereco: string,
): Promise<number | null> {
  try {
    const origins = `${origemLat},${origemLng}`;
    const url =
      `https://maps.googleapis.com/maps/api/distancematrix/json` +
      `?origins=${encodeURIComponent(origins)}` +
      `&destinations=${encodeURIComponent(destinoEndereco)}` +
      `&key=${MAPS_KEY}` +
      `&units=metric`;
    const res = await fetch(url);
    const data = await res.json();
    if (
      data.status === 'OK' &&
      data.rows?.[0]?.elements?.[0]?.status === 'OK'
    ) {
      return data.rows[0].elements[0].distance.value / 1000;
    }
    return null;
  } catch {
    return null;
  }
}
