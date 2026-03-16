import { AuthResponse, LoginRequest } from "@/types/auth.types";

// Leemos la URL base desde las variables de entorno
const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/usuarios`;

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

export const solicitarRecuperacion = async (email: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_URL}/forgot-password`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Error al procesar la solicitud.");
    }
    return data;
};

export const restablecerPassword = async (token: string, newPassword: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_URL}/reset-password`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, newPassword }),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Error al restablecer la contraseña.");
    }
    return data;
};