import { AdapterUserEntity } from './Entity/AdapterUserEntity';

export interface AuthController {
  handleRequest(event: any): Promise<any>;
  register(user: AdapterUserEntity): Promise<AdapterUserEntity>;
  login(email: string, password: string): Promise<AdapterUserEntity>;
  resetPassword(email: string, newPassword: string): Promise<AdapterUserEntity>;
  updateUser(
    id: number,
    updates: Partial<Pick<AdapterUserEntity, 'nombre' | 'email' | 'password' | 'estado'>>
  ): Promise<AdapterUserEntity>;
}
