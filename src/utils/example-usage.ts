/**
 * EJEMPLO DE USO DEL JWT VALIDATOR EN OTRA LAMBDA
 *
 * Este archivo muestra cómo usar el validador JWT en otras lambdas.
 * Copia este código a tu otra lambda y ajusta según tus necesidades.
 */

import { extractTokenFromEvent, getTokenPayload, validateTokenFromEvent } from './jwt-validator';

/**
 * Ejemplo 1: Validación simple con respuesta de error
 */
export const handlerSimple = async (event: any) => {
  const validation = validateTokenFromEvent(event);

  if (!validation.valid) {
    return {
      statusCode: 401,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Unauthorized',
        error: validation.error,
      }),
    };
  }

  // Token válido, usar el payload
  const { userId, email, name, type } = validation.payload!;

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Success',
      userId,
      email,
      name,
      type,
    }),
  };
};

/**
 * Ejemplo 2: Validación con payload directo
 */
export const handlerWithPayload = async (event: any) => {
  const payload = await getTokenPayload(event);

  if (!payload) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Unauthorized' }),
    };
  }

  const { userId, email } = payload;

  // Tu lógica aquí usando userId y email
  const result = await processUserData(userId);

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, data: result }),
  };
};

/**
 * Ejemplo 3: Validación con verificación de permisos
 */
export const handlerWithPermissions = async (event: any) => {
  const validation = validateTokenFromEvent(event);

  if (!validation.valid || !validation.payload) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Unauthorized' }),
    };
  }

  const { userId, type } = validation.payload;

  // Verificar permisos
  if (type !== 'admin') {
    return {
      statusCode: 403,
      body: JSON.stringify({ message: 'Forbidden: Admin access required' }),
    };
  }

  // Solo admins pueden ejecutar esta lógica
  const result = await processAdminAction(userId);

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, data: result }),
  };
};

/**
 * Ejemplo 4: Validación manual con extracción de token
 */
export const handlerManual = async (event: any) => {
  const token = extractTokenFromEvent(event);

  if (!token) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Token not found' }),
    };
  }

  // Validar token manualmente
  const { JWTValidator } = await import('./jwt-validator');
  const validator = new JWTValidator();
  const validation = validator.validateToken(token);

  if (!validation.valid) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: validation.error }),
    };
  }

  const payload = validation.payload!;
  // Tu lógica aquí

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, userId: payload.userId }),
  };
};

/**
 * Ejemplo 5: Middleware helper para múltiples endpoints
 */
export const createAuthenticatedHandler = (handler: (event: any, payload: any) => Promise<any>) => {
  return async (event: any) => {
    const payload = await getTokenPayload(event);

    if (!payload) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Unauthorized' }),
      };
    }

    try {
      return await handler(event, payload);
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: 'Internal server error',
          error: error instanceof Error ? error.message : 'Unknown error',
        }),
      };
    }
  };
};

// Uso del middleware helper:
export const myProtectedEndpoint = createAuthenticatedHandler(async (event, payload) => {
  const { userId, email } = payload;
  // Tu lógica aquí con el payload
  return {
    statusCode: 200,
    body: JSON.stringify({ userId, email }),
  };
});

// Funciones auxiliares de ejemplo (implementar según necesidad)
async function processUserData(userId: number): Promise<any> {
  // Tu lógica aquí
  return { userId };
}

async function processAdminAction(userId: number): Promise<any> {
  // Tu lógica aquí
  return { userId };
}
