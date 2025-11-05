# MS Rapiserv Ordes Lambda

Microservicio de ordenes implementado como AWS Lambda usando TypeScript, TypeORM, MySQL e InversifyJS.

## 🏗️ Arquitectura

Este proyecto sigue una **arquitectura hexagonal (Clean Architecture)** con las siguientes capas:

- **Domain**: Lógica de negocio y entidades de dominio
- **Application**: Servicios de aplicación e interfaces
- **Infrastructure**: Implementaciones de repositorios y fuentes de datos
- **Adapter**: Controladores REST y mappers
- **Presenter**: Formateo de respuestas

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

Configura las siguientes variables en tu función Lambda:

```bash
DB_HOST=tu-host-mysql
DB_PORT=3306
DB_USERNAME=tu-usuario
DB_PASSWORD=tu-password
DB_DATABASE=tu-base-de-datos
```

**Nota**: Actualmente las credenciales están hardcodeadas en `data-source.ts`. Se recomienda migrar a variables de entorno para producción.

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

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE.md](LICENSE.md) para más detalles.

## 👥 Autor

David Ortega
