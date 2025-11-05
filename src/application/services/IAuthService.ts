import { DomainUserEntity } from '../../domain/Entities/DomainUserEntity';
import { LoginResponse } from '../../domain/Entities/LoginResponse';
import { TokenPayload } from './IAuthTokenService';

export interface IAuthService {
  register(user: DomainUserEntity): Promise<DomainUserEntity>;
  login(email: string, password: string): Promise<LoginResponse>;
  resetPassword(email: string, newPassword: string): Promise<DomainUserEntity>;
  updateUser(
    id: number,
    updates: Partial<Pick<DomainUserEntity, 'name' | 'email' | 'password' | 'status'>>
  ): Promise<DomainUserEntity>;
  validateToken(token: string): Promise<TokenPayload>;
}
