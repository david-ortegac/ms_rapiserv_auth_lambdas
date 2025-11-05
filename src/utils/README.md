# JWT Validator - Módulo Reutilizable

Este módulo permite validar tokens JWT en otras lambdas sin necesidad de importar todo el servicio de autenticación.

## Instalación

Copia los siguientes archivos a tu otra lambda:

- `src/utils/jwt-validator.ts`
- `src/application/services/IAuthTokenService.ts` (para el tipo `TokenPayload`)

O simplemente instala las dependencias necesarias:

```bash
npm install jsonwebtoken @types/jsonwebtoken
```

## Uso Básico

### Opción 1: Validación Simple

```typescript
import { validateTokenFromEvent } from './utils/jwt-validator';

export const handler = async (event: any) => {
  // Validar token del evento
  const validation = validateTokenFromEvent(event);

  if (!validation.valid) {
    return {
      statusCode: 401,
      body: JSON.stringify({
        message: 'Unauthorized',
        error: validation.error,
      }),
    };
  }

  // Usar el payload del token
  const { userId, email, name, type } = validation.payload!;

  // Tu lógica aquí...
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Success', userId }),
  };
};
```

### Opción 2: Extraer Token Manualmente

```typescript
import { extractTokenFromEvent, getJWTValidator } from './utils/jwt-validator';

export const handler = async (event: any) => {
  const token = extractTokenFromEvent(event);

  if (!token) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Token not found' }),
    };
  }

  const validator = getJWTValidator();
  const validation = validator.validateToken(token);

  if (!validation.valid) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: validation.error }),
    };
  }

  const payload = validation.payload!;
  // Tu lógica aquí...
};
```

### Opción 3: Obtener Payload Directamente

```typescript
import { getTokenPayload } from './utils/jwt-validator';

export const handler = async (event: any) => {
  const payload = await getTokenPayload(event);

  if (!payload) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Unauthorized' }),
    };
  }

  // Usar el payload directamente
  const { userId, email, name, type } = payload;
  // Tu lógica aquí...
};
```

## Configuración

### Variables de Entorno

Asegúrate de configurar estas variables de entorno en tu lambda:

```bash
JWT_SECRET_KEY=tu-clave-secreta-muy-segura
JWT_ISSUER=ms-auth-lambda  # Opcional, por defecto
JWT_AUDIENCE=pwa-client     # Opcional, por defecto
```

### Configuración Personalizada

Si necesitas usar diferentes valores de issuer o audience:

```typescript
import { validateTokenFromEvent } from './utils/jwt-validator';

const validation = validateTokenFromEvent(event, {
  issuer: 'mi-issuer-personalizado',
  audience: 'mi-audience-personalizado',
  secretKey: 'mi-clave-secreta', // Si no usas variable de entorno
});
```

## Ejemplo Completo

```typescript
import { getTokenPayload } from './utils/jwt-validator';

export const handler = async (event: any) => {
  try {
    // Validar token
    const payload = await getTokenPayload(event);

    if (!payload) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Unauthorized: Invalid or missing token',
        }),
      };
    }

    // Extraer información del usuario
    const { userId, email, name, type } = payload;

    // Verificar permisos si es necesario
    if (type !== 'admin') {
      return {
        statusCode: 403,
        body: JSON.stringify({
          message: 'Forbidden: Insufficient permissions',
        }),
      };
    }

    // Tu lógica de negocio aquí
    const result = await processRequest(userId, event);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data: result,
        userId,
      }),
    };
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
```

## Tipos TypeScript

```typescript
import { TokenPayload, TokenValidationResult } from './utils/jwt-validator';

// TokenPayload contiene:
// - userId: number
// - email: string
// - name: string
// - type: string

// TokenValidationResult contiene:
// - valid: boolean
// - payload?: TokenPayload
// - error?: string
```

## Notas Importantes

1. **Seguridad**: Asegúrate de que `JWT_SECRET_KEY` sea la misma en todas las lambdas que usen el mismo sistema de autenticación.

2. **Performance**: El validador usa una instancia singleton para evitar crear múltiples instancias.

3. **Manejo de Errores**: Todas las funciones manejan errores internamente y retornan resultados seguros.

4. **Headers**: El token puede venir en el header `Authorization` con el formato `Bearer <token>`.

5. **Body**: También puedes enviar el token en el body como `{ "token": "..." }`.

6. **Query Parameters**: También puedes enviar el token como query parameter `?token=...`.
