import * as jwt from 'jsonwebtoken';

/**
 * Payload del token JWT
 */
export interface TokenPayload {
  userId: number;
  email: string;
  name: string;
  type: string;
  iat?: number;
  exp?: number;
}

/**
 * Opciones de configuración para el validador JWT
 */
export interface JWTValidatorOptions {
  secretKey?: string;
  issuer?: string;
  audience?: string;
}

/**
 * Resultado de la validación del token
 */
export interface TokenValidationResult {
  valid: boolean;
  payload?: TokenPayload;
  error?: string;
}

/**
 * Clase para validar tokens JWT
 * Reutilizable en otras lambdas
 */
export class JWTValidator {
  private readonly secretKey: string;
  private readonly issuer: string;
  private readonly audience: string;

  constructor(options: JWTValidatorOptions = {}) {
    this.secretKey =
      options.secretKey ||
      process.env.JWT_SECRET_KEY ||
      (() => {
        throw new Error('JWT_SECRET_KEY is required');
      })();
    this.issuer = options.issuer || process.env.JWT_ISSUER || 'ms-auth-lambda';
    this.audience = options.audience || process.env.JWT_AUDIENCE || 'pwa-client';
  }

  /**
   * Verifica y decodifica un token JWT
   * @param token - Token JWT a verificar
   * @returns Payload del token decodificado
   * @throws Error si el token es inválido o expirado
   */
  verifyToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.secretKey, {
        issuer: this.issuer,
        audience: this.audience,
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

  /**
   * Valida si un token es válido sin lanzar excepciones
   * @param token - Token JWT a validar
   * @returns Resultado de la validación
   */
  validateToken(token: string): TokenValidationResult {
    try {
      const payload = this.verifyToken(token);
      return {
        valid: true,
        payload,
      };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

/**
 * Extrae el token JWT de un evento de Lambda
 * @param event - Evento de Lambda
 * @returns Token JWT o null si no se encuentra
 */
export function extractTokenFromEvent(event: any): string | null {
  // Intentar obtener el token del header Authorization
  const authHeader = event?.headers?.Authorization || event?.headers?.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.replace('Bearer ', '');
  }

  // Intentar obtener el token del body
  if (event?.body) {
    try {
      const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
      if (body?.token) {
        return body.token;
      }
    } catch {
      // Si el body no es JSON válido, continuar
    }
  }

  // Intentar obtener el token de query parameters
  if (event?.queryStringParameters?.token) {
    return event.queryStringParameters.token;
  }

  return null;
}

/**
 * Valida un token JWT desde un evento de Lambda
 * @param event - Evento de Lambda
 * @param options - Opciones de configuración del validador
 * @returns Resultado de la validación
 */
export function validateTokenFromEvent(event: any, options?: JWTValidatorOptions): TokenValidationResult {
  const token = extractTokenFromEvent(event);
  if (!token) {
    return {
      valid: false,
      error: 'Token not found in request',
    };
  }

  const validator = new JWTValidator(options);
  return validator.validateToken(token);
}

/**
 * Middleware helper para validar tokens en lambdas
 * Retorna el payload del token si es válido, o null si no lo es
 * @param event - Evento de Lambda
 * @param options - Opciones de configuración del validador
 * @returns Payload del token o null si es inválido
 */
export async function getTokenPayload(event: any, options?: JWTValidatorOptions): Promise<TokenPayload | null> {
  try {
    const token = extractTokenFromEvent(event);
    if (!token) {
      return null;
    }

    const validator = new JWTValidator(options);
    const result = validator.validateToken(token);
    return result.valid && result.payload ? result.payload : null;
  } catch {
    return null;
  }
}

/**
 * Instancia singleton del validador JWT
 * Úsala si necesitas validar múltiples tokens con la misma configuración
 */
let validatorInstance: JWTValidator | null = null;

/**
 * Obtiene una instancia singleton del validador JWT
 * @param options - Opciones de configuración del validador
 * @returns Instancia del validador
 */
export function getJWTValidator(options?: JWTValidatorOptions): JWTValidator {
  if (!validatorInstance) {
    validatorInstance = new JWTValidator(options);
  }
  return validatorInstance;
}
