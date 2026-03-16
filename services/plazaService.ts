const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getHeaders = (token: string) => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${token}`,
});

export const obtenerMisPlazas = async (token: string) => {
  const res = await fetch(`${API_URL}/api/plazas`, { headers: getHeaders(token) });
  if (!res.ok) throw new Error("Error al obtener las plazas");
  return res.json();
};

export const obtenerCategorias = async (token: string) => {
  const res = await fetch(`${API_URL}/api/plazas/categorias`, { headers: getHeaders(token) });
  if (!res.ok) throw new Error("Error al obtener categorías");
  return res.json();
};

export const obtenerPlazaPorId = async (estId: number, plazaId: number, token: string) => {
  const res = await fetch(`${API_URL}/api/plazas/${estId}/${plazaId}`, { headers: getHeaders(token) });
  if (!res.ok) throw new Error("Error al obtener la plaza");
  return res.json();
};

export const crearPlaza = async (data: any, token: string) => {
  const res = await fetch(`${API_URL}/api/plazas`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Error al crear plaza");
  }
  return res.json();
};

export const crearPlazasEnLote = async (data: any, token: string) => {
  const res = await fetch(`${API_URL}/api/plazas/lote`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.text();
    // Extraemos el mensaje de error de Spring Boot si viene en formato JSON o texto plano
    try {
      const parsedErr = JSON.parse(err);
      throw new Error(parsedErr.message || "Error al crear las plazas masivamente");
    } catch {
      throw new Error(err || "Error al crear las plazas masivamente");
    }
  }
  return res.json();
};

export const editarPlaza = async (estId: number, plazaId: number, data: any, token: string) => {
  const res = await fetch(`${API_URL}/api/plazas/${estId}/${plazaId}`, {
    method: "PUT",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Error al editar plaza");
  }
  return res.json();
};