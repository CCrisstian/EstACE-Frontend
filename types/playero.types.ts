export interface Playero {
  legajo: number;
  dni: number;
  avatarUrl?: string | null;
  nombre: string;
  apellido: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  nombreEstacionamiento: string; // Para mostrar en la tabla
  estacionamientoId: number;     // Para rellenar el select al editar
  activo: boolean;
}

export interface PlayeroRequest {
  dni: number;
  nombre: string;
  apellido: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  password?: string; // Opcional al editar
  rol: 'Playero';
  estacionamientoId?: number; // Obligatorio si es Playero
  activo: boolean;
}