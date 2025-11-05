import { DomainUserEntity } from '../../domain/Entities/DomainUserEntity';

export interface TokenPayload {
  email: string;
  name: string;
}

export interface IAuthTokenService {
  generateToken(user: DomainUserEntity): string;
  verifyToken(token: string): TokenPayload;
  validateToken(token: string): boolean;
}
