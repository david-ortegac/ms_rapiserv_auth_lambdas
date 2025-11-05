import { TokenPayload } from '../../../../application/services/IAuthTokenService';
import { AdapterUserEntity } from './Entity/AdapterUserEntity';

export interface LoginResponseAdapter {
  user: AdapterUserEntity;
  token: string;
}

export interface AuthController {
  handleRequest(event: any): Promise<any>;
  register(user: AdapterUserEntity): Promise<AdapterUserEntity>;
  login(email: string, password: string): Promise<LoginResponseAdapter>;
  resetPassword(email: string, newPassword: string): Promise<AdapterUserEntity>;
  updateUser(
    id: number,
    updates: Partial<Pick<AdapterUserEntity, 'nombre' | 'email' | 'password' | 'estado'>>
  ): Promise<AdapterUserEntity>;
  validateToken(token: string): Promise<TokenPayload>;
}
