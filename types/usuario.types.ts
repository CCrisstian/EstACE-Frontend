export interface UsuarioResponse {
    legajo: number;
    dni: number;
    nombre: string;
    apellido: string;
    avatarUrl?: string | null;
    tipo: string;
}

export interface UsuarioUpdateRequest {
    dni: number;
    nombre: string;
    apellido: string;
    avatarUrl?: string | null;
    password?: string; // El signo ? indica que es opcional
}