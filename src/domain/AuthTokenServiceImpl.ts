import { injectable } from 'inversify';
import jwt from 'jsonwebtoken';

import { IAuthTokenService, TokenPayload } from '../application/services/IAuthTokenService';
import { DomainUserEntity } from './Entities/DomainUserEntity';

@injectable()
export class AuthTokenServiceImpl implements IAuthTokenService {
  private readonly secretKey: string;
  private readonly expiresIn: string;

  constructor() {
    this.secretKey = process.env.JWT_SECRET_KEY;
    this.expiresIn = process.env.JWT_EXPIRES_IN;
  }

  generateToken(user: DomainUserEntity): string {
    if (!user.id) {
      throw new Error('User ID is required to generate token');
    }

    const payload: TokenPayload = {
      email: user.email,
      name: user.name,
    };

    return jwt.sign(payload, this.secretKey, {
      expiresIn: this.expiresIn,
      issuer: 'ms-auth-lambda',
      audience: 'pwa-client',
    });
  }

  verifyToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.secretKey, {
        issuer: 'ms-auth-lambda',
        audience: 'pwa-client',
      }) as TokenPayload;

      return decoded;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expired');
      }
      throw new Error('Token verification failed');
    }
  }

  validateToken(token: string): boolean {
    try {
      this.verifyToken(token);
      return true;
    } catch {
      return false;
    }
  }
}
