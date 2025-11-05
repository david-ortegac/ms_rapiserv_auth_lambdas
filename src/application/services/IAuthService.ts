import { DomainUserEntity } from '../../domain/Entities/DomainUserEntity';

export interface IAuthService {
  register(user: DomainUserEntity): Promise<DomainUserEntity>;
  login(email: string, password: string): Promise<DomainUserEntity>;
  resetPassword(email: string, newPassword: string): Promise<DomainUserEntity>;
}
