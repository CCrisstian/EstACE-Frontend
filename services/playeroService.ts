import { Playero, PlayeroRequest } from "@/types/playero.types";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "https://estace-v2.onrender.com") + "/api/playeros";

const getHeaders = (token: string) => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${token}`,
});

export const obtenerMisPlayeros = async (token: string): Promise<Playero[]> => {
  const res = await fetch(API_URL, { headers: getHeaders(token) });
  if (!res.ok) throw new Error("Error al obtener playeros");
  return res.json();
};

export const obtenerPlayeroPorId = async (id: number, token: string): Promise<Playero> => {
  const res = await fetch(`${API_URL}/${id}`, { headers: getHeaders(token) });
  if (!res.ok) throw new Error("Error al obtener el playero");
  return res.json();
};

export const crearPlayero = async (data: PlayeroRequest, token: string): Promise<Playero> => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const errorData = await res.text(); // Intentamos leer el mensaje del backend
    throw new Error(errorData || "Error al crear playero");
  }
  return res.json();
};

export const editarPlayero = async (id: number, data: PlayeroRequest, token: string): Promise<Playero> => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.text();
    throw new Error(errorData || "Error al editar playero");
  }
  return res.json();
};