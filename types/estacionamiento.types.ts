// Este tipo representa lo que el Backend devuelve (La Entidad)
export interface Estacionamiento {
  id: number;
  nombre: string;
  provincia: string;
  localidad: string;
  direccion: string;
  latitud: number;
  longitud: number;
  diasAtencion: string;
  hraAtencion: string;
  diasFeriadoAtencion: boolean;
  finDeSemanaAtencion: boolean;
  horaFinDeSemana: string | null;
  disponibilidad: boolean;
  puntaje: number;
  puntajeAcumulado: number;
  cantidadVotos: number;
}

// Este tipo representa lo que enviamos para CREAR o EDITAR (El DTO)
// Debe coincidir con 'EstacionamientoRequest.java' del backend
export interface EstacionamientoFormData {
  nombre: string;
  provincia: string;
  localidad: string;
  direccion: string;
  latitud: number | null;
  longitud: number | null;
  
  diasAtencion: string;
  hraAtencion: string;
  diasFeriadoAtencion: boolean;
  finDeSemanaAtencion: boolean;
  horaFinDeSemana: string | null;
  
  disponibilidad: boolean;
}