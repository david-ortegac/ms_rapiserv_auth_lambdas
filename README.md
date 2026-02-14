# MS Rapiserv Ordes Lambda

Microservicio de ordenes implementado como AWS Lambda usando TypeScript, TypeORM, MySQL e InversifyJS.

## 🏗️ Arquitectura

Este proyecto sigue una **arquitectura hexagonal (Clean Architecture)** con las siguientes capas:

- **Domain**: Lógica de negocio y entidades de dominio
- **Application**: Servicios de aplicación e interfaces
- **Infrastructure**: Implementaciones de repositorios y fuentes de datos
- **Adapter**: Controladores REST y mappers
- **Presenter**: Formateo de respuestas

### Documentación y diagramas

Los diagramas están en [docs/](docs/) en formato Mermaid (`.mmd`). Puedes visualizarlos en [Mermaid Live](https://mermaid.live) pegando el contenido de cada archivo.

| Diagrama | Archivo | Descripción |
|----------|---------|-------------|
| **Componentes** | [docs/component-diagram.mmd](docs/component-diagram.mmd) | Capas y dependencias entre componentes (Adapter, Domain, Infrastructure). |
| **Clases** | [docs/class-diagram.mmd](docs/class-diagram.mmd) | Interfaces, implementaciones y entidades del proyecto. |
| **Entidad-Relación** | [docs/er-diagram.mmd](docs/er-diagram.mmd) | Modelo de datos (tabla `users`). |
| **Infraestructura** | [docs/infrastructure-diagram.mmd](docs/infrastructure-diagram.mmd) | Lambda, API Gateway, MySQL y pipeline de build. |
| **Secuencia (flujo general)** | [docs/sequence-diagram.mmd](docs/sequence-diagram.mmd) | Entrada a la Lambda y enrutado de peticiones. |
| **Secuencia: Registro** | [docs/sequence-register.mmd](docs/sequence-register.mmd) | POST /register. |
| **Secuencia: Login** | [docs/sequence-login.mmd](docs/sequence-login.mmd) | POST /login. |
| **Secuencia: Validar token** | [docs/sequence-validate-token.mmd](docs/sequence-validate-token.mmd) | POST /validate-token. |
| **Secuencia: Reset password** | [docs/sequence-reset-password.mmd](docs/sequence-reset-password.mmd) | POST /reset-password. |
| **Secuencia: Actualizar usuario** | [docs/sequence-update-user.mmd](docs/sequence-update-user.mmd) | PUT /users/{id}. |

Índice completo de documentación: [docs/README.md](docs/README.md).

## 📋 Requisitos Previos

- Node.js 22.x o superior
- npm o yarn
- Acceso a base de datos MySQL

## 🚀 Instalación

```bash
# Instalar dependencias
npm install
```

## 🛠️ Scripts Disponibles

### Desarrollo

```bash
# Compilar TypeScript (modo desarrollo)
npm run build-app
```

### Build para Lambda

```bash
# Limpiar directorio de distribución
npm run clean

# Build completo con bundling de dependencias
npm run build

# Empaquetar para deploy (build + zip)
npm run package
```

### Linting y Formato

```bash
# Ejecutar linter
npm run lint

# Corregir problemas de linting
npm run lint:fix

# Formatear código con Prettier
npm run prettier
```

## 📦 Proceso de Build

El proyecto usa **esbuild** para crear un bundle optimizado que incluye:

1. Todo el código TypeScript compilado
2. Todas las dependencias necesarias (excepto aws-sdk)
3. Sourcemaps para debugging

El resultado se genera en la carpeta `dist/` con:

- `index.js` - Lambda handler y todo el código bundled
- `index.js.map` - Sourcemap
- `package.json` - Metadata del paquete

## 🚢 Despliegue a AWS Lambda

### Opción 1: Manual

```bash
# 1. Generar el paquete
npm run package

# 2. Subir el archivo .zip generado en releases/ a AWS Lambda
```

### Opción 2: AWS CLI

```bash
# Build y package
npm run package

# Deploy usando AWS CLI
aws lambda update-function-code \
  --function-name tu-funcion-lambda \
  --zip-file fileb://releases/ms-products-lambda-v0.0.1.zip
```

## 🏃 Ejecución Local (Desarrollo)

Para probar localmente, puedes usar AWS SAM CLI:

```bash
# Instalar SAM CLI primero
# https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html

# Invocar localmente
sam local invoke -e event.json
```

## 🔧 Configuración

### Variables de Entorno

Configura las siguientes variables en tu función Lambda (o en un archivo `.env` en desarrollo). Todas son **necesarias** para el correcto funcionamiento del microservicio, salvo `DB_PORT` y `NODE_ENV`, que tienen valores por defecto.

| Variable | Tipo | Longitud / Formato | Descripción |
|----------|------|--------------------|-------------|
| `AES_SECRET_KEY` | `string` | **32 caracteres** (recomendado para AES-256) | Clave secreta para cifrado/descifrado de contraseñas (AES). Debe ser la misma en todos los entornos que compartan usuarios. |
| `DB_DATABASE` | `string` | Nombre de la base de datos | Nombre de la base de datos MySQL. |
| `DB_HOST` | `string` | Host o URL | Host o dominio del servidor MySQL (ej. `localhost`, `www.ejemplo.com`). |
| `DB_PASSWORD` | `string` | — | Contraseña del usuario MySQL. |
| `DB_PORT` | `string` (numérico) | Opcional, por defecto `3306` | Puerto del servidor MySQL. |
| `DB_USERNAME` | `string` | — | Usuario de conexión a MySQL. |
| `JWT_EXPIRES_IN` | `string` | Formato vercel/ms (ej. `1h`, `7d`, `30m`) | Tiempo de expiración del token JWT. |
| `JWT_SECRET_KEY` | `string` | Mín. 256 bits (64 caracteres hex recomendado) | Clave secreta para firmar y verificar tokens JWT. Debe ser la misma en todas las lambdas que validen el mismo token. |
| `NODE_ENV` | `string` | `development` \| `production` | Entorno de ejecución. En `production` se desactiva `synchronize` de TypeORM y el logging SQL. |

#### Ejemplo de configuración (placeholders)

**No subas valores reales al repositorio.** Usa AWS Lambda Environment Variables, AWS Secrets Manager o un `.env` local (y añade `.env` al `.gitignore`).

```bash
# Base de datos MySQL
DB_HOST=tu-host-mysql
DB_PORT=3306
DB_USERNAME=tu-usuario
DB_PASSWORD=tu-password
DB_DATABASE=tu-base-de-datos

# Cifrado de contraseñas (AES) — 32 caracteres
AES_SECRET_KEY=tu-clave-aes-32-caracteres!!

# JWT
JWT_SECRET_KEY=tu-clave-jwt-min-64-chars-hex-o-mas
JWT_EXPIRES_IN=1h

# Entorno
NODE_ENV=production
```

**Nota**: Asegúrate de que `AES_SECRET_KEY` tenga exactamente **32 caracteres** si usas AES-256 con la configuración por defecto del proyecto.

## 📁 Estructura del Proyecto

```
src/
├── adapter/          # Controladores REST y mappers
├── application/      # Servicios de aplicación
├── domain/           # Lógica de negocio y entidades
├── infrastructure/   # Repositorios y conexión a DB
├── ioc/             # Configuración de inyección de dependencias
└── presenter/       # Formateo de respuestas

build.config.mjs     # Configuración de build con esbuild
tsconfig.json        # Configuración de TypeScript
```

## 🧪 Testing

```bash
# TODO: Implementar tests
npm test
```

## 📝 Notas Importantes

1. **Reflect Metadata**: El proyecto usa decoradores y necesita `reflect-metadata`. El bundling con esbuild incluye esta dependencia automáticamente.
2. **TypeORM**: Se usa TypeORM para la gestión de la base de datos MySQL.
3. **InversifyJS**: Inyección de dependencias usando InversifyJS para mantener bajo acoplamiento.
4. **Tamaño del Bundle**: El bundle final incluye todas las dependencias. Monitorea el tamaño para mantenerlo optimizado.

## 🐛 Troubleshooting

### Error: Cannot find module 'reflect-metadata'

✅ **Solucionado**: El nuevo proceso de build con esbuild incluye todas las dependencias.

### Error: ErrorOptions not found

✅ **Solucionado**: Actualizado tsconfig.json a ES2022.

### Error al comprimir

Verifica que tienes `bestzip` instalado y que el directorio `releases/` existe.

## 🔐 Validación de Tokens JWT en Otras Lambdas

Este proyecto incluye un módulo reutilizable para validar tokens JWT en otras lambdas sin necesidad de importar todo el servicio de autenticación.

### Uso Rápido

```typescript
import { validateTokenFromEvent } from './utils/jwt-validator';

export const handler = async (event: any) => {
  const validation = validateTokenFromEvent(event);
  
  if (!validation.valid) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Unauthorized', error: validation.error }),
    };
  }

  const { userId, email, name, type } = validation.payload!;
  // Tu lógica aquí...
};
```

Para más información, consulta [src/utils/README.md](src/utils/README.md).

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE.md](LICENSE.md) para más detalles.

## 👥 Autor

David Ortega
