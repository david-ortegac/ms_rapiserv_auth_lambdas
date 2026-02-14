# Variables de Entorno - MS Auth Lambda

Todas las variables listadas son **necesarias** para el correcto funcionamiento del microservicio, excepto las indicadas como opcionales.

## Tabla de variables

| Variable | Tipo | Longitud / Formato | Requerida | Descripción |
|----------|------|--------------------|-----------|-------------|
| `AES_SECRET_KEY` | `string` | **32 caracteres** (AES-256) | Sí | Clave secreta para cifrado/descifrado de contraseñas (AES). Debe ser la misma en todos los entornos que compartan usuarios. |
| `DB_DATABASE` | `string` | Nombre de la BD | Sí | Nombre de la base de datos MySQL. |
| `DB_HOST` | `string` | Host o URL | Sí | Host o dominio del servidor MySQL. |
| `DB_PASSWORD` | `string` | — | Sí | Contraseña del usuario MySQL. |
| `DB_PORT` | `string` (numérico) | Por defecto `3306` | No | Puerto del servidor MySQL. |
| `DB_USERNAME` | `string` | — | Sí | Usuario de conexión a MySQL. |
| `JWT_EXPIRES_IN` | `string` | Ej. `1h`, `7d`, `30m` | Sí | Tiempo de expiración del token JWT. |
| `JWT_SECRET_KEY` | `string` | Mín. 256 bits (64 chars hex recomendado) | Sí | Clave para firmar y verificar tokens JWT. Misma en todas las lambdas que validen el mismo token. |
| `NODE_ENV` | `string` | `development` \| `production` | No | Entorno. En `production` se desactiva `synchronize` de TypeORM. |

## Uso en el código

- **Base de datos**: `src/infraestructure/mysql/data-source.ts` (`DB_*`, `NODE_ENV`).
- **Cifrado**: `src/domain/CypherServiceImpl.ts` (`AES_SECRET_KEY`).
- **JWT**: `src/domain/AuthTokenServiceImpl.ts` (`JWT_SECRET_KEY`, `JWT_EXPIRES_IN`).

## Seguridad

- No subas valores reales al repositorio.
- Usa **AWS Lambda Environment Variables** o **AWS Secrets Manager** en producción.
- Mantén `.env` en `.gitignore` y usa `.env.example` solo como plantilla sin secretos.
