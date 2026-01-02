// src/services/estacionamientoService.ts

import { Estacionamiento, EstacionamientoFormData } from "@/types/estacionamiento.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://estace-v2.onrender.com";

const getAuthHeaders = (token: string) => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${token}`,
});

// Función auxiliar para manejar respuestas y errores
const handleResponse = async (response: Response, defaultError: string) => {
  if (!response.ok) {
    let mensajeError = defaultError;
    try {
      const text = await response.text();
      try {
         const json = JSON.parse(text);
         mensajeError = json.error || json.message || text || defaultError;
      } catch {
         mensajeError = text.length > 0 ? text : defaultError;
      }
    } catch (e) {
      mensajeError = `${defaultError} (Status: ${response.status} ${response.statusText})`;
    }
    throw new Error(mensajeError);
  }
  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

// --- ENDPOINTS ---

export const obtenerMisEstacionamientos = async (token: string): Promise<Estacionamiento[]> => {
  // Este estaba bien
  const response = await fetch(`${API_URL}/api/estacionamientos/mis-estacionamientos`, {
    method: "GET",
    headers: getAuthHeaders(token),
  });

  return await handleResponse(response, "Error al obtener los estacionamientos");
};

/**
 * Obtener un estacionamiento por ID
 */
export const obtenerEstacionamientoPorId = async (id: number, token: string): Promise<Estacionamiento> => {
  // CORRECCIÓN: Agregamos "/api"
  const response = await fetch(`${API_URL}/api/estacionamientos/${id}`, {
    method: "GET",
    headers: getAuthHeaders(token),
  });

  return await handleResponse(response, "No se pudo obtener el estacionamiento");
};

/**
 * Crear un nuevo estacionamiento
 */
export const crearEstacionamiento = async (data: EstacionamientoFormData, token: string): Promise<Estacionamiento> => {
  // CORRECCIÓN: Agregamos "/api"
  const response = await fetch(`${API_URL}/api/estacionamientos`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });

  return await handleResponse(response, "Error al crear el estacionamiento");
};

/**
 * Editar un estacionamiento existente
 */
export const editarEstacionamiento = async (id: number, data: EstacionamientoFormData, token: string): Promise<Estacionamiento> => {
  // CORRECCIÓN: Agregamos "/api"
  const response = await fetch(`${API_URL}/api/estacionamientos/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });

  return await handleResponse(response, "Error al editar el estacionamiento");
};