import { DomainUserEntity } from '../../domain/Entities/DomainUserEntity';

export interface TokenPayload {
  userId: number;
  email: string;
  name: string;
  type: string;
}

export interface IAuthTokenService {
  generateToken(user: DomainUserEntity): string;
  verifyToken(token: string): TokenPayload;
  validateToken(token: string): boolean;
}
