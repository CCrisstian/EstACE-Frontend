// src/services/estacionamientoService.ts

import { Estacionamiento, EstacionamientoFormData } from "@/types/estacionamiento.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://estace-v2.onrender.com/api";

const getAuthHeaders = (token: string) => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${token}`,
});

// Función auxiliar para manejar respuestas y errores de forma segura
const handleResponse = async (response: Response, defaultError: string) => {
  // 1. Verificamos si hubo error HTTP
  if (!response.ok) {
    let mensajeError = defaultError;
    try {
      // Leemos el cuerpo como texto crudo primero
      const text = await response.text();
      
      // Intentamos ver si es un JSON válido
      try {
         const json = JSON.parse(text);
         // Si es JSON, buscamos campos comunes de error
         mensajeError = json.error || json.message || text || defaultError;
      } catch {
         // Si falla el parseo a JSON, significa que es texto plano (tu caso actual)
         // Usamos el texto directamente si no está vacío
         mensajeError = text.length > 0 ? text : defaultError;
      }
      
    } catch (e) {
      // Si falla incluso leer el texto, usamos el status
      mensajeError = `${defaultError} (Status: ${response.status} ${response.statusText})`;
    }
    throw new Error(mensajeError);
  }

  // 2. Si es exitoso, leemos el JSON
  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

// ... resto de las funciones (obtenerMisEstacionamientos, etc) ...

/**
 * Obtener los estacionamientos del dueño logueado
 */
export const obtenerMisEstacionamientos = async (token: string): Promise<Estacionamiento[]> => {
  const response = await fetch(`${API_URL}/estacionamientos/mis-estacionamientos`, {
    method: "GET",
    headers: getAuthHeaders(token),
  });

  return await handleResponse(response, "Error al obtener los estacionamientos");
};

/**
 * Obtener un estacionamiento por ID
 */
export const obtenerEstacionamientoPorId = async (id: number, token: string): Promise<Estacionamiento> => {
  const response = await fetch(`${API_URL}/estacionamientos/${id}`, {
    method: "GET",
    headers: getAuthHeaders(token),
  });

  return await handleResponse(response, "No se pudo obtener el estacionamiento");
};

/**
 * Crear un nuevo estacionamiento
 */
export const crearEstacionamiento = async (data: EstacionamientoFormData, token: string): Promise<Estacionamiento> => {
  const response = await fetch(`${API_URL}/estacionamientos`, {
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
  const response = await fetch(`${API_URL}/estacionamientos/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });

  return await handleResponse(response, "Error al editar el estacionamiento");
};