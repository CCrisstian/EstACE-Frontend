export interface Coordenadas {
  lat: number | null;
  lon: number | null;
  display_name?: string; // Nombre completo encontrado por Nominatim
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

interface ReverseGeocodingResult {
  calle: string;
  altura: string;
  localidad: string;
  provincia: string;
}

/**
 * Busca las coordenadas de una dirección usando OpenStreetMap (Nominatim).
 */
export const obtenerCoordenadas = async (
  direccion: string, 
  localidad: string, 
  provincia: string
): Promise<Coordenadas> => {
  try {
    // 1. Armamos la dirección completa
    // Formato: "Dirección, Localidad, Provincia, Argentina"
    const direccionCompleta = `${direccion}, ${localidad}, ${provincia}, Argentina`;
    
    // 2. Construimos la URL
    // format=json: para recibir datos procesables
    // limit=1: solo queremos el resultado más probable
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(direccionCompleta)}&format=json&limit=1`;

    // 3. Hacemos la petición
    // Nota: Nominatim pide un User-Agent. En navegadores modernos el browser pone uno por defecto.
    const response = await fetch(url);
    
    if (!response.ok) return { lat: null, lon: null };

    const data: NominatimResult[] = await response.json();

    // 4. Verificamos si hay resultados
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        display_name: data[0].display_name
      };
    }

    return { lat: null, lon: null };
    
  } catch (error) {
    console.error("Error en geocodificación:", error);
    return { lat: null, lon: null };
  }
};

/**
 * Obtiene la dirección aproximada basada en coordenadas.
 * MEJORA: Se agrega zoom=18 para intentar capturar la altura exacta.
 */
export const obtenerDireccionDesdeCoordenadas = async (lat: number, lon: number): Promise<ReverseGeocodingResult | null> => {
  try {
    // zoom=18: Fuerza la búsqueda a nivel de edificio/puerta
    // addressdetails=1: Asegura que devuelva el desglose completo
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=18&addressdetails=1`;
    
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    const addr = data.address || {};

    // 1. Mejoramos la detección de la calle buscando en más campos posibles
    const calle = addr.road || addr.pedestrian || addr.street || addr.residential || addr.suburb || "";
    
    // 2. Intentamos obtener la altura (house_number)
    // Nota: Si el número no está mapeado en OpenStreetMap, esto seguirá llegando vacío.
    const altura = addr.house_number || "";
    
    // 3. Normalización de Localidad (OpenStreetMap es caótico con esto)
    const localidad = addr.city || addr.town || addr.village || addr.city_district || addr.municipality || "";
    
    const provincia = addr.state || addr.province || "";

    return { calle, altura, localidad, provincia };
  } catch (error) {
    console.error("Error en reverse geocoding:", error);
    return null;
  }
};