export interface UsuarioResponse {
    legajo: number;
    dni: number;
    nombre: string;
    apellido: string;
    avatarUrl?: string | null;
    tipo: string;
    email?: string;
    telefono?: string;
    direccion?: string;
}

export interface UsuarioUpdateRequest {
    dni: number;
    nombre: string;
    apellido: string;
    avatarUrl?: string | null;
    password?: string; // El signo ? indica que es opcional
    email?: string;
    telefono?: string;
    direccion?: string;
}