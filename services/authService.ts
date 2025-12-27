import { AuthResponse, LoginRequest } from "@/types/auth.types";

const API_URL = "https://estace-v2.onrender.com/api/usuarios";

export const loginUsuario = async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
    });

    if (!response.ok) {
        throw new Error("Error en el login: Credenciales inválidas");
    }

    return await response.json();
};