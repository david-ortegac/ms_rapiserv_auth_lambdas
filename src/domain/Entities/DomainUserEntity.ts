export interface DomainUserEntity {
  id?: number;
  name: string;
  email: string;
  password: string;
  status: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
