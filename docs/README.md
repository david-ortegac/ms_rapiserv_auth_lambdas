# Documentación - MS Auth Lambda

Índice de la documentación del proyecto.

## Diagramas (Mermaid)

Los archivos `.mmd` se pueden abrir en [Mermaid Live](https://mermaid.live) para visualizar o exportar a PNG/SVG.

### Arquitectura y componentes

| Diagrama | Archivo | Descripción |
|----------|---------|-------------|
| Componentes | [component-diagram.mmd](component-diagram.mmd) | Capas (Entry, Adapter, Application, Domain, Infrastructure) y dependencias entre componentes. |
| Clases | [class-diagram.mmd](class-diagram.mmd) | Interfaces, implementaciones y entidades del proyecto. |
| Entidad-Relación | [er-diagram.mmd](er-diagram.mmd) | Modelo de datos: tabla `users`. |
| Infraestructura | [infrastructure-diagram.mmd](infrastructure-diagram.mmd) | AWS Lambda, API Gateway, MySQL y pipeline de build. |


## Diagrama de Componentes - MS Auth Lambda
### Arquitectura: Clean Architecture / Hexagonal
Entry → Adapter (REST) → Application (Ports) → Domain (Use Cases) → Infrastructure

```mermaid
flowchart TB
    subgraph entry["Entry Point"]
        Handler["handler (index.ts)"]
    end

    subgraph adapter["Adapter - REST"]
        AuthController["AuthController"]
        AuthControllerImpl["AuthControllerImpl"]
        IAdapterMapper["IAdapterMapper"]
        AdapterMapperImpl["AdapterMapperImpl"]
    end

    subgraph application["Application - Ports"]
        IAuthService["IAuthService"]
        IAuthTokenService["IAuthTokenService"]
        ICypherService["ICypherService"]
    end

    subgraph domain["Domain - Use Cases"]
        AuthServiceImpl["AuthServiceImpl"]
        AuthTokenServiceImpl["AuthTokenServiceImpl"]
        CypherServiceImpl["CypherServiceImpl"]
    end

    subgraph infrastructure["Infrastructure"]
        MysqlUserRepository["MysqlUserRepository"]
        MysqlUserRepositoryImpl["MysqlUserRepositoryImpl"]
        IInfraestructureMapper["IInfraestructureMapper"]
        InfraestructureMapperImpl["InfraestructureMapperImpl"]
        AppDataSource["AppDataSource (TypeORM)"]
        UserEntity["User Entity"]
    end

    subgraph entities["Entities"]
        AdapterUserEntity["AdapterUserEntity"]
        DomainUserEntity["DomainUserEntity"]
        LoginResponse["LoginResponse"]
    end

    %% Flujo principal
    Handler -->|"handleRequest"| AuthControllerImpl
    AuthControllerImpl -.->|implements| AuthController
    AuthControllerImpl --> IAuthService
    AuthControllerImpl --> IAdapterMapper
    AdapterMapperImpl -.->|implements| IAdapterMapper
    AuthControllerImpl --> AdapterMapperImpl

    %% Domain implementa Application
    AuthServiceImpl -.->|implements| IAuthService
    AuthTokenServiceImpl -.->|implements| IAuthTokenService
    CypherServiceImpl -.->|implements| ICypherService

    %% AuthServiceImpl depende de
    AuthServiceImpl --> MysqlUserRepository
    AuthServiceImpl --> IInfraestructureMapper
    AuthServiceImpl --> ICypherService
    AuthServiceImpl --> IAuthTokenService
    AuthServiceImpl --> InfraestructureMapperImpl

    %% Infrastructure
    MysqlUserRepositoryImpl -.->|implements| MysqlUserRepository
    AuthServiceImpl --> MysqlUserRepositoryImpl
    InfraestructureMapperImpl -.->|implements| IInfraestructureMapper
    MysqlUserRepositoryImpl -->|"Repository&lt;User&gt;"| AppDataSource
    AppDataSource --> UserEntity

    %% Mappers y entidades
    IAdapterMapper -->|"AdapterUserEntity ↔ DomainUserEntity"| AdapterMapperImpl
    IInfraestructureMapper -->|"User ↔ DomainUserEntity"| InfraestructureMapperImpl
    InfraestructureMapperImpl --> UserEntity
    InfraestructureMapperImpl --> DomainUserEntity
    AuthServiceImpl --> DomainUserEntity
    AuthServiceImpl --> LoginResponse
    AuthControllerImpl --> AdapterUserEntity

    %% Estilos por capa
    classDef entry fill:#e3f2fd
    classDef adapter fill:#fff8e1
    classDef application fill:#f3e5f5
    classDef domain fill:#e8f5e9
    classDef infra fill:#ffebee
    classDef entity fill:#eceff1
    class Handler entry
    class AuthController,AuthControllerImpl,IAdapterMapper,AdapterMapperImpl adapter
    class IAuthService,IAuthTokenService,ICypherService application
    class AuthServiceImpl,AuthTokenServiceImpl,CypherServiceImpl domain
    class MysqlUserRepository,MysqlUserRepositoryImpl,IInfraestructureMapper,InfraestructureMapperImpl,AppDataSource,UserEntity infra
    class AdapterUserEntity,DomainUserEntity,LoginResponse entity

```

## Diagrama de Clases - MS Auth Lambda
### Generado a partir del análisis del código (Clean Architecture)

```mermaid
classDiagram
    %% ========== ENTRY ==========
    class handler {
        +handler(event) Promise~any~
    }

    %% ========== ADAPTER - Interfaces ==========
    class AuthController {
        <<interface>>
        +handleRequest(event) Promise~any~
        +register(user) Promise~AdapterUserEntity~
        +login(email, password) Promise~LoginResponseAdapter~
        +resetPassword(email, newPassword) Promise~AdapterUserEntity~
        +updateUser(id, updates) Promise~AdapterUserEntity~
        +validateToken(token) Promise~TokenPayload~
    }

    class IAdapterMapper {
        <<interface>>
        +toUserDomain(adapterEntity) DomainUserEntity
        +toUserAdapter(domainEntity) AdapterUserEntity
        +toUserDomainList(adapterList) DomainUserEntity[]
        +toUserAdapterList(domainList) AdapterUserEntity[]
    }

    %% ========== ADAPTER - Implementaciones ==========
    class AuthControllerImpl {
        -authService IAuthService
        -mapper IAdapterMapper
        +handleRequest(event) Promise~any~
        +register(user) Promise~AdapterUserEntity~
        +login(email, password) Promise~LoginResponseAdapter~
        +resetPassword(email, newPassword) Promise~AdapterUserEntity~
        +updateUser(id, updates) Promise~AdapterUserEntity~
        +validateToken(token) Promise~TokenPayload~
        -extractTokenFromEvent(event, body) string?
        -validateTokenInRequest(event) Promise~TokenPayload?~
    }

    class AdapterMapperImpl {
        +toUserDomain(adapterEntity) DomainUserEntity
        +toUserAdapter(domainEntity) AdapterUserEntity
        +toUserDomainList(adapterList) DomainUserEntity[]
        +toUserAdapterList(domainList) AdapterUserEntity[]
    }

    %% ========== APPLICATION - Ports ==========
    class IAuthService {
        <<interface>>
        +register(user) Promise~DomainUserEntity~
        +login(email, password) Promise~LoginResponse~
        +resetPassword(email, newPassword) Promise~DomainUserEntity~
        +updateUser(id, updates) Promise~DomainUserEntity~
        +validateToken(token) Promise~TokenPayload~
    }

    class IAuthTokenService {
        <<interface>>
        +generateToken(user) string
        +verifyToken(token) TokenPayload
        +validateToken(token) boolean
    }

    class ICypherService {
        <<interface>>
        +encrypt(text) string
        +decrypt(text) string
    }

    %% ========== DOMAIN - Use Cases ==========
    class AuthServiceImpl {
        -repository MysqlUserRepository
        -mapper IInfraestructureMapper
        -cypherService ICypherService
        -tokenService IAuthTokenService
        +register(user) Promise~DomainUserEntity~
        +login(email, password) Promise~LoginResponse~
        +resetPassword(email, newPassword) Promise~DomainUserEntity~
        +updateUser(id, updates) Promise~DomainUserEntity~
        +validateToken(token) Promise~TokenPayload~
    }

    class AuthTokenServiceImpl {
        -secretKey string
        -expiresIn string
        +generateToken(user) string
        +verifyToken(token) TokenPayload
        +validateToken(token) boolean
    }

    class CypherServiceImpl {
        -secretKey string
        +encrypt(text) string
        +decrypt(encryptedText) string
    }

    %% ========== INFRASTRUCTURE - Interfaces ==========
    class MysqlUserRepository {
        <<interface>>
        +findById(id) Promise~User?~
        +findByEmail(email) Promise~User?~
        +create(user) Promise~User~
        +update(user) Promise~User~
        +delete(id) Promise~void~
    }

    class IInfraestructureMapper {
        <<interface>>
        +toUserDomain(entity) DomainUserEntity
        +toUserEntity(domain) User
        +toUserDomainList(entityList) DomainUserEntity[]
        +toUserEntityList(domainList) User[]
    }

    %% ========== INFRASTRUCTURE - Implementaciones ==========
    class MysqlUserRepositoryImpl {
        -userRepository Repository~User~
        +findById(id) Promise~User?~
        +findByEmail(email) Promise~User?~
        +create(user) Promise~User~
        +update(user) Promise~User~
        +delete(id) Promise~void~
    }

    class InfraestructureMapperImpl {
        +toUserDomain(entity) DomainUserEntity
        +toUserEntity(domain) User
        +toUserDomainList(entityList) DomainUserEntity[]
        +toUserEntityList(domainList) User[]
    }

    %% ========== ENTIDADES ==========
    class AdapterUserEntity {
        <<interface/DTO>>
        +id number?
        +nombre string
        +email string
        +password string
        +estado StatusUser?
        +tipo TypeUser?
        +fechaCreacion Date?
        +fechaActualizacion Date?
        +creadoPor string?
        +actualizadoPor string?
    }

    class DomainUserEntity {
        <<interface>>
        +id number?
        +name string
        +email string
        +password string
        +status string
        +type string
        +createdAt Date
        +updatedAt Date
        +createdBy string
        +updatedBy string
    }

    class LoginResponse {
        <<interface>>
        +user DomainUserEntity
        +token string
    }

    class TokenPayload {
        <<interface>>
        +email string
        +name string
    }

    class User {
        <<TypeORM Entity>>
        +id number
        +name string
        +email string
        +password string
        +status string
        +type string
        +created_at Date
        +updated_at Date
        +created_by string
        +updated_by string
    }

    %% ========== RELACIONES ==========
    handler ..> AuthControllerImpl : usa
    AuthControllerImpl ..|> AuthController : implementa
    AuthControllerImpl --> IAuthService : usa
    AuthControllerImpl --> IAdapterMapper : usa
    AdapterMapperImpl ..|> IAdapterMapper : implementa
    AuthControllerImpl --> AdapterMapperImpl : usa

    IAuthService <|.. AuthServiceImpl : implementa
    AuthServiceImpl --> MysqlUserRepository : usa
    AuthServiceImpl --> IInfraestructureMapper : usa
    AuthServiceImpl --> ICypherService : usa
    AuthServiceImpl --> IAuthTokenService : usa
    AuthServiceImpl --> InfraestructureMapperImpl : usa

    IAuthTokenService <|.. AuthTokenServiceImpl : implementa
    ICypherService <|.. CypherServiceImpl : implementa

    MysqlUserRepository <|.. MysqlUserRepositoryImpl : implementa
    AuthServiceImpl --> MysqlUserRepositoryImpl : usa
    MysqlUserRepositoryImpl --> User : persiste
    IInfraestructureMapper <|.. InfraestructureMapperImpl : implementa
    InfraestructureMapperImpl ..> User : mapea
    InfraestructureMapperImpl ..> DomainUserEntity : mapea
    AdapterMapperImpl ..> AdapterUserEntity : mapea
    AdapterMapperImpl ..> DomainUserEntity : mapea

    AuthServiceImpl ..> DomainUserEntity : usa
    AuthServiceImpl ..> LoginResponse : retorna
    AuthControllerImpl ..> AdapterUserEntity : usa
    AuthTokenServiceImpl ..> DomainUserEntity : usa
    AuthTokenServiceImpl ..> TokenPayload : retorna

```

## Diagrama Entidad-Relación - MS Auth Lambda
### Basado en la entidad TypeORM User (tabla users)
- Base de datos: MySQL

```mermaid
erDiagram
    users {
        bigint id PK "Primary key, auto-increment"
        varchar name "255 chars"
        varchar email UK "255 chars, unique"
        text password "Contraseña cifrada (AES)"
        varchar status "50 chars, default 'active'"
        varchar type "50 chars, default 'user'"
        timestamp created_at "CURRENT_TIMESTAMP"
        timestamp updated_at "CURRENT_TIMESTAMP ON UPDATE"
        varchar created_by "255 chars"
        varchar updated_by "255 chars"
    }

    %% Notas:
    %% - PK: Primary Key
    %% - UK: Unique Key
    %% - En esta versión del microservicio no hay relaciones con otras tablas.
    %% - Futuras tablas (roles, sesiones, etc.) se relacionarían con users.id

```

## Diagrama de Infraestructura - MS Auth Lambda
### Despliegue: AWS Lambda + API Gateway + MySQL
- Build: TypeScript + esbuild -> dist -> zip -> Lambda

```mermaid
flowchart TB
    subgraph client["Cliente"]
        Client["Cliente HTTP / API"]
    end

    subgraph aws["AWS Cloud"]
        subgraph api["API Gateway"]
            APIGW["REST API<br/>POST /register, /login<br/>POST /validate-token, /reset-password<br/>PUT /users/{id}"]
        end

        subgraph compute["Compute"]
            Lambda["AWS Lambda<br/>ms_auth_lambda<br/>handler(event)"]
        end

        subgraph config["Configuración Lambda"]
            EnvVars["Variables de entorno<br/>DB_HOST, DB_PORT<br/>DB_USERNAME, DB_PASSWORD<br/>DB_DATABASE<br/>JWT_SECRET_KEY, JWT_EXPIRES_IN<br/>AES_SECRET_KEY"]
        end
    end

    subgraph external["Externo / VPC"]
        MySQL["MySQL<br/>Base de datos<br/>Tabla: users"]
    end

    subgraph build["Pipeline de Build (local/CI)"]
        Src["src/ (TypeScript)"]
        Esbuild["esbuild"]
        Dist["dist/<br/>index.js + package.json"]
        Zip["bestzip"]
        Pkg["releases/*.zip"]
    end

    %% Flujo de peticiones
    Client -->|"HTTPS"| APIGW
    APIGW -->|"Invoca"| Lambda
    Lambda -->|"TypeORM<br/>MySQL2"| MySQL
    Lambda --> EnvVars

    %% Flujo de build
    Src --> Esbuild
    Esbuild --> Dist
    Dist --> Zip
    Zip --> Pkg
    Pkg -.->|"Deploy manual / CLI"| Lambda

    %% Estilos
    classDef clientStyle fill:#e3f2fd
    classDef awsStyle fill:#fff8e1
    classDef externalStyle fill:#ffebee
    classDef buildStyle fill:#e8f5e9
    class Client clientStyle
    class APIGW,Lambda,EnvVars awsStyle
    class MySQL externalStyle
    class Src,Esbuild,Dist,Zip,Pkg buildStyle

```


### Diagramas de secuencia

| Diagrama | Archivo | Descripción |
|----------|---------|-------------|
| Flujo general | [sequence-diagram.mmd](sequence-diagram.mmd) | Entrada a la Lambda y enrutado de peticiones. |
| Registro | [sequence-register.mmd](sequence-register.mmd) | POST /register. |
| Login | [sequence-login.mmd](sequence-login.mmd) | POST /login. |
| Validar token | [sequence-validate-token.mmd](sequence-validate-token.mmd) | POST /validate-token. |
| Reset password | [sequence-reset-password.mmd](sequence-reset-password.mmd) | POST /reset-password. |
| Actualizar usuario | [sequence-update-user.mmd](sequence-update-user.mmd) | PUT /users/{id}. |

## Diagrama de Secuencia - MS Auth Lambda
### Flujo general: Entrada a la Lambda

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente / API Gateway
    participant Handler as handler (index.ts)
    participant DS as AppDataSource
    participant IoC as Container (Inversify)
    participant Ctrl as AuthControllerImpl
    participant Svc as AuthServiceImpl

    Client->>+Handler: event (HTTP request)
    Handler->>Handler: ¿DataSource inicializado?
    alt No inicializado
        Handler->>DS: initialize()
        DS-->>Handler: ok
    end
    Handler->>IoC: get(TYPES.AuthController)
    IoC-->>Handler: AuthControllerImpl
    Handler->>Ctrl: handleRequest(event)
    Ctrl->>Ctrl: parse method, path, body
    alt POST /register
        Ctrl->>Svc: register(domainUser)
    else POST /login
        Ctrl->>Svc: login(email, password)
    else POST /validate-token
        Ctrl->>Svc: validateToken(token)
    else POST /reset-password
        Ctrl->>Svc: resetPassword(email, newPassword)
    else PUT /users/{id}
        Ctrl->>Svc: updateUser(id, updates)
    end
    Svc-->>Ctrl: resultado
    Ctrl-->>Handler: { statusCode, body }
    Handler-->>-Client: response

```
## Otros documentos

| Documento | Descripción |
|-----------|-------------|
| [environment-variables.md](environment-variables.md) | Variables de entorno: tipo, longitud y uso. |

```mermaid

```
