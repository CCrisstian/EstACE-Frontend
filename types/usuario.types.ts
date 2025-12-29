export interface UsuarioResponse {
    legajo: number;
    dni: number;
    nombre: string;
    apellido: string;
    tipo: string;
}

export interface UsuarioUpdateRequest {
    dni: number;
    nombre: string;
    apellido: string;
    password?: string; // El signo ? indica que es opcional
}