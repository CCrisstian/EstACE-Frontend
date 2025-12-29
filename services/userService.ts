import { UsuarioResponse, UsuarioUpdateRequest } from "@/types/usuario.types";

// Ajustar la URL base según corresponda (Local o Render)
const API_URL = "https://estace-v2.onrender.com/api/usuarios"; 
// para local: "http://localhost:8080/api/usuarios"

// --- 1. Obtener Perfil (GET) ---
export const obtenerPerfil = async (token: string): Promise<UsuarioResponse> => {
    const response = await fetch(`${API_URL}/perfil`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error("Error al obtener los datos del perfil");
    }

    return await response.json();
};

// --- 2. Actualizar Perfil (PUT) ---
export const actualizarPerfil = async (token: string, datos: UsuarioUpdateRequest): Promise<void> => {
    const response = await fetch(`${API_URL}/perfil`, { 
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(datos),
    });

    if (!response.ok) {
        // Intentamos leer el mensaje de error del backend si existe
        const errorData = await response.json().catch(() => ({}));
        throw new Error(JSON.stringify(errorData) || "Error al actualizar el perfil");
    }
};