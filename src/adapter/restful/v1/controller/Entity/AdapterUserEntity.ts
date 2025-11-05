export interface AdapterUserEntity {
  id?: number;
  nombre: string;
  email: string;
  password: string;
  estado: string;
  tipo: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  creadoPor: string;
  actualizadoPor: string;
}
