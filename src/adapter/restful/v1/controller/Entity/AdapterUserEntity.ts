export interface AdapterUserEntity {
  id?: number;
  nombre: string;
  email: string;
  password: string;
  estado?: StatusUser;
  tipo?: TypeUser;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
  creadoPor?: string;
  actualizadoPor?: string;
}

export enum TypeUser {
  ADMIN = 'admin',
  USER = 'user',
}

export enum StatusUser {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}
