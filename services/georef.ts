// Definimos los tipos de datos que devuelve la API de Argentina
interface Provincia {
  id: string;
  nombre: string;
}

interface Localidad {
  id: string;
  nombre: string;
  provincia: {
    id: string;
    nombre: string;
  };
}

interface GeorefResponse<T> {
  provincias?: T[];
  localidades?: T[];
  total: number;
}

const BASE_URL = "https://apis.datos.gob.ar/georef/api";

// Obtiene la lista de provincias ordenadas alfabéticamente.

export const obtenerProvincias = async (): Promise<Provincia[]> => {
  try {
    const response = await fetch(`${BASE_URL}/provincias?max=27`);
    if (!response.ok) throw new Error("Error al obtener provincias");

    const data: GeorefResponse<Provincia> = await response.json();
    
    // Ordenamos alfabéticamente
    return (data.provincias || []).sort((a, b) => a.nombre.localeCompare(b.nombre));
  } catch (error) {
    console.error(error);
    return [];
  }
};

/**
 * Obtiene las localidades de una provincia específica.
 * @param nombreProvincia El nombre exacto de la provincia seleccionada
 */
export const obtenerLocalidades = async (nombreProvincia: string): Promise<Localidad[]> => {
  try {
    if (!nombreProvincia) return [];

    // La API requiere el nombre de la provincia como parámetro
    // Usamos max=5000 para asegurar traer todas
    const url = `${BASE_URL}/localidades?provincia=${encodeURIComponent(nombreProvincia)}&max=5000`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error("Error al obtener localidades");

    const data: GeorefResponse<Localidad> = await response.json();

    // Ordenamos alfabéticamente
    return (data.localidades || []).sort((a, b) => a.nombre.localeCompare(b.nombre));
  } catch (error) {
    console.error(error);
    return [];
  }
};