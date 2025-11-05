import { DomainUserEntity } from './DomainUserEntity';

export interface LoginResponse {
  user: DomainUserEntity;
  token: string;
}
