export interface AuthResponse {
    legajo: number;
    dni: number;
    nombre: string;
    apellido: string;
    tipo: string;
    token: string; // ¡La joya de la corona!
}

export interface LoginRequest {
    legajo: number;
    password: string;
}