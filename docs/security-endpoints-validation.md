# Validación de seguridad por endpoint - API Auth

Este documento valida el nivel de seguridad de cada endpoint del microservicio de autenticación y propone mejoras.

---

## Resumen por endpoint

| Endpoint | Autenticación | Autorización | Protección datos | Validación entrada | Nivel riesgo |
|----------|---------------|--------------|------------------|--------------------|--------------|
| POST /register | No requerida (público) | N/A | Contraseña cifrada (AES) | Ninguna | **Media** |
| POST /login | No requerida (público) | N/A | Contraseña cifrada; JWT en respuesta | Ninguna | **Media** |
| POST /validate-token | Token JWT (quien llama no identificado) | N/A | Token verificado (firma + expiración) | Ninguna | **Baja** |
| POST /reset-password | No requerida (solo conocimiento de email + contraseña actual) | N/A | Contraseña actual validada; nueva cifrada | Ninguna | **Media** |
| PUT /user-update | API_KEY en header Authorization | Cualquiera con API_KEY puede actualizar cualquier usuario por id | No expone contraseña en body de respuesta | Ninguna | **Media-Alta** |

---

## 1. POST /register

**Propósito:** Registrar un nuevo usuario.

| Aspecto | Estado actual | Detalle |
|---------|----------------|--------|
| **Autenticación** | No requerida | Endpoint público (correcto para registro). |
| **Autorización** | N/A | — |
| **Confidencialidad** | Parcial | Contraseña cifrada con AES antes de persistir. Body de la petición viaja en texto si no hay HTTPS (debe forzarse en API Gateway). |
| **Integridad** | Parcial | Sin validación de formato de email, longitud ni complejidad de contraseña. |
| **Disponibilidad / abuso** | Riesgo | Sin rate limiting: posible registro masivo o enumeración de emails existentes. |

**Mensajes que revelan información:**
- `"User already exists with this email"` → permite **enumerar usuarios** por email.

**Nivel de seguridad estimado:** **Media** (contraseña cifrada; faltan validación de entrada y mitigación de enumeración/abuso).

**Recomendaciones:**
- Validar formato de email (regex/validator) y longitud máxima.
- Política de contraseña: longitud mínima (ej. 8), mayúsculas, minúsculas, números, símbolos.
- Limitar longitud de `nombre`, `email`, `password` y campos opcionales para evitar payloads enormes.
- Respuesta genérica en registro: mismo mensaje para "email ya existe" y "registro correcto" (o solo "Si el email no existe, se ha enviado un enlace...") para reducir enumeración.
- Rate limiting en API Gateway o WAF por IP / API key.
- HTTPS obligatorio en API Gateway.

---

## 2. POST /login

**Propósito:** Iniciar sesión y obtener un JWT.

| Aspecto | Estado actual | Detalle |
|---------|----------------|--------|
| **Autenticación** | No requerida (es el mecanismo que la provee) | Correcto. |
| **Autorización** | N/A | — |
| **Confidencialidad** | Parcial | Contraseña no se almacena en claro; se compara tras descifrar. JWT firmado con secreto. |
| **Integridad** | Parcial | Sin validación de formato de email ni longitud de campos. |
| **Disponibilidad / abuso** | Riesgo | Sin rate limiting: **riesgo de fuerza bruta** sobre contraseñas. |

**Mensajes que revelan información:**
- Mensaje único `"Invalid email or password"` para usuario inexistente y contraseña incorrecta → **buena práctica** (no enumera usuarios).
- `"User account is not active"` → **sí revela** que el usuario existe; valorar mensaje genérico si se prioriza no enumerar.

**Nivel de seguridad estimado:** **Media** (buen manejo de errores de credenciales; falta rate limiting y validación de entrada).

**Recomendaciones:**
- Rate limiting estricto por IP (y opcionalmente por email) para mitigar fuerza bruta.
- Validar formato de email y longitud máxima de email/password.
- Considerar mensaje genérico también para cuenta inactiva (ej. "Invalid email or password") si se quiere evitar enumeración.
- JWT: mantener `expiresIn` razonable (ej. 1h) y almacenar en httpOnly cookie o solo en memoria en el cliente; no en localStorage si hay riesgo XSS.
- HTTPS obligatorio.

---

## 3. POST /validate-token

**Propósito:** Verificar si un JWT es válido y obtener el payload.

| Aspecto | Estado actual | Detalle |
|---------|----------------|--------|
| **Autenticación** | Token JWT | Quien llama no se identifica; solo se valida el token. |
| **Autorización** | N/A | Cualquiera con un token válido puede validarlo (uso esperado). |
| **Confidencialidad** | Aceptable | Token verificado con firma (JWT_SECRET_KEY) y expiración. Payload (email, name, type) no es ultra sensible. |
| **Integridad** | Aceptable | Firma JWT detecta manipulación. |
| **Canales** | Riesgo menor | Token aceptado por **query string** (`?token=...`) → puede quedar en logs, referrer, historial. |

**Nivel de seguridad estimado:** **Baja** (endpoint razonablemente seguro; mejora evitar token en query).

**Recomendaciones:**
- **No aceptar token en query string**; solo en `Authorization: Bearer <token>` o en body (body menos ideal que header por logs).
- Mantener `issuer` y `audience` en la verificación JWT (ya implementado).
- Opcional: rate limiting por IP para evitar abuso de validación masiva.

---

## 4. POST /reset-password

**Propósito:** Cambiar contraseña conociendo email y contraseña actual.

| Aspecto | Estado actual | Detalle |
|---------|----------------|--------|
| **Autenticación** | No requerida | Se “autentica” con email + contraseña actual. |
| **Autorización** | Implícita | Solo quien conoce la contraseña actual puede cambiarla. |
| **Confidencialidad** | Aceptable | Contraseña actual validada; nueva cifrada (AES) al guardar. |
| **Integridad** | Parcial | Sin validación de fortaleza de la nueva contraseña ni longitud. |
| **Disponibilidad / abuso** | Riesgo | Sin rate limiting: fuerza bruta sobre contraseña actual o enumeración de emails. |

**Mensajes que revelan información:**
- `"User not found"` → **enumera usuarios** por email.
- `"Invalid old password"` → confirma que el usuario existe.

**Nivel de seguridad estimado:** **Media** (flujo correcto con contraseña actual; faltan validación de nueva contraseña, rate limiting y mensajes que no enumeren).

**Recomendaciones:**
- Mismo mensaje genérico para "user not found" e "invalid old password" (ej. "If the data is correct, the password has been updated") para no enumerar.
- Validar fortaleza y longitud de la nueva contraseña (mismas reglas que en registro).
- Rate limiting por IP y/o por email.
- Opcional: flujo con token de un solo uso (link por email) en lugar de solo contraseña actual, para mayor seguridad.

---

## 5. PUT /user-update

**Propósito:** Actualizar datos de usuario (nombre, estado, tipo; no email en el flujo actual).

| Aspecto | Estado actual | Detalle |
|---------|----------------|--------|
| **Autenticación** | API_KEY | Header `Authorization: <API_KEY>` (comparación directa con `process.env.API_KEY`). |
| **Autorización** | Débil | Cualquiera con la API_KEY puede actualizar **cualquier usuario** indicando solo `id`. No hay comprobación “este token/API_KEY corresponde a este usuario”. |
| **Confidencialidad** | Aceptable | No se devuelve contraseña en la respuesta. |
| **Integridad** | Parcial | Sin validación de longitud o valores permitidos para nombre, estado, tipo. |
| **Secreto** | Riesgo | API_KEY única y compartida; si se filtra, compromete todas las actualizaciones. |

**Nivel de seguridad estimado:** **Media-Alta** (protegido por secreto; autorización muy amplia y dependencia de una sola clave).

**Recomendaciones:**
- **Autorización por identidad:** si el cliente es un usuario final, usar JWT (payload con `id` o `sub`) y permitir actualizar solo el usuario identificado por ese token (no cualquier `id` en body).
- Si la API_KEY es para un servicio backend (admin): mantenerla pero restringir en API Gateway/WAF por IP o VPC; rotar la clave periódicamente; usar secretos (ej. AWS Secrets Manager) y no la misma clave que para otras funciones.
- No confiar solo en `id` en body: preferir `id` en path y/o obtenido del token.
- Validar longitud y valores permitidos para `nombre`, `estado`, `tipo` (whitelist de estados/tipos).
- Comparación del header con la API_KEY en **tiempo constante** para evitar timing attacks (ej. `crypto.timingSafeEqual` si se compara con buffer).

---

## Controles transversales (todos los endpoints)

| Control | Estado | Recomendación |
|--------|--------|----------------|
| **HTTPS** | Depende de API Gateway | Forzar HTTPS y redirigir HTTP→HTTPS. |
| **Rate limiting** | No implementado en código | Añadir en API Gateway (throttling) o WAF por IP/API key. |
| **Validación de entrada** | Prácticamente inexistente | Validar tipos, longitudes máximas y formatos (email, contraseña) en adapter o capa de aplicación. |
| **CORS** | Depende de API Gateway | Configurar orígenes permitidos; no usar `*` en producción. |
| **Logs** | Posible registro de body/headers | No loguear contraseñas ni tokens completos; solo indicadores (ej. “login attempt”). |
| **JSON.parse(event.body)** | Sin try/catch específico | Envolver en try/catch para body mal formado y devolver 400. |
| **Errores 500** | Mensaje genérico al cliente | Mantener; no exponer stack ni detalles internos. |

---

## Priorización de mejoras

1. **Alta:** Rate limiting (login, register, reset-password); eliminar token en query en validate-token.
2. **Alta:** Validación de entrada (email, longitud, política de contraseña) en register, login y reset-password.
3. **Media:** Reducir enumeración de usuarios (mensajes genéricos en register y reset-password; opcional en login para cuenta inactiva).
4. **Media:** PUT /user-update: autorización por JWT (usuario solo puede actualizarse a sí mismo) o restricción clara del uso de API_KEY (admin/servicio).
5. **Baja:** Comparación en tiempo constante para API_KEY; validación de longitud/whitelist en user-update.

Si quieres, el siguiente paso puede ser implementar validación de entrada (email + contraseña) y/o un middleware de rate limiting en el handler.
