import { inject, injectable } from 'inversify';

import { IAuthService } from '../../../../application/services/IAuthService';
import { TokenPayload } from '../../../../application/services/IAuthTokenService';
import { DomainUserEntity } from '../../../../domain/Entities/DomainUserEntity';
import { TYPES } from '../../../../ioc/Types';
import { AuthController, LoginResponseAdapter } from './AuthController';
import { AdapterUserEntity } from './Entity/AdapterUserEntity';
import { IAdapterMapper } from './Mapper/IAdapterMapper';

@injectable()
export class AuthControllerImpl implements AuthController {
  constructor(
    @inject(TYPES.AuthService)
    private readonly authService: IAuthService,
    @inject(TYPES.IAdapterMapper) private readonly mapper: IAdapterMapper
  ) {}

  async handleRequest(event: any): Promise<any> {
    try {
      const method = event?.requestContext?.http?.method;

      if (method === 'POST') {
        const path = event?.rawPath || event?.path || '';
        const body = JSON.parse(event?.body || '{}');

        if (path.includes('/register')) {
          const registeredUser = await this.register(body);
          return {
            statusCode: 201,
            body: JSON.stringify(registeredUser),
          };
        }

        if (path.includes('/login')) {
          const loginResponse = await this.login(body.email, body.password);
          return {
            statusCode: 200,
            body: JSON.stringify(loginResponse),
          };
        }

        if (path.includes('/validate-token')) {
          const token = this.extractTokenFromEvent(event, body);
          if (!token) {
            return {
              statusCode: 400,
              body: JSON.stringify({ message: 'Token is required' }),
            };
          }
          try {
            const payload = await this.validateToken(token);
            return {
              statusCode: 200,
              body: JSON.stringify({ valid: true, payload }),
            };
          } catch (error) {
            return {
              statusCode: 401,
              body: JSON.stringify({
                valid: false,
                message: error instanceof Error ? error.message : 'Invalid token',
              }),
            };
          }
        }

        if (path.includes('/reset-password')) {
          const updatedUser = await this.resetPassword(body.email, body.newPassword);
          return {
            statusCode: 200,
            body: JSON.stringify(updatedUser),
          };
        }

        return {
          statusCode: 404,
          body: JSON.stringify({ message: 'Endpoint not found' }),
        };
      }

      if (method === 'PUT') {
        const path = event?.rawPath || event?.path || '';
        const body = JSON.parse(event?.body || '{}');
        const id = event?.pathParameters?.id ? Number.parseInt(event.pathParameters.id) : body.id;

        if (path.includes('/{id}') || path.includes('/update')) {
          if (!id) {
            return {
              statusCode: 400,
              body: JSON.stringify({ message: 'User ID is required' }),
            };
          }

          const updates: Partial<Pick<AdapterUserEntity, 'nombre' | 'email' | 'password' | 'estado'>> = {};
          if (body.nombre !== undefined) updates.nombre = body.nombre;
          if (body.email !== undefined) updates.email = body.email;
          if (body.password !== undefined) updates.password = body.password;
          if (body.estado !== undefined) updates.estado = body.estado;

          const updatedUser = await this.updateUser(id, updates);
          return {
            statusCode: 200,
            body: JSON.stringify(updatedUser),
          };
        }

        return {
          statusCode: 404,
          body: JSON.stringify({ message: 'Endpoint not found' }),
        };
      }

      return {
        statusCode: 405,
        body: JSON.stringify({
          message: `Unsupported HTTP method: ${method}`,
        }),
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: `Error processing request: ${error instanceof Error ? error.message : 'Unknown error'}`,
        }),
      };
    }
  }

  async register(user: AdapterUserEntity): Promise<AdapterUserEntity> {
    const userEntity = this.mapper.toUserDomain(user);
    const createdUser = await this.authService.register(userEntity);
    return this.mapper.toUserAdapter(createdUser);
  }

  async login(email: string, password: string): Promise<LoginResponseAdapter> {
    const loginResponse = await this.authService.login(email, password);
    return {
      user: this.mapper.toUserAdapter(loginResponse.user),
      token: loginResponse.token,
    };
  }

  async validateToken(token: string): Promise<TokenPayload> {
    return await this.authService.validateToken(token);
  }

  async resetPassword(email: string, newPassword: string): Promise<AdapterUserEntity> {
    const updatedUser = await this.authService.resetPassword(email, newPassword);
    return this.mapper.toUserAdapter(updatedUser);
  }

  async updateUser(
    id: number,
    updates: Partial<Pick<AdapterUserEntity, 'nombre' | 'email' | 'password' | 'estado'>>
  ): Promise<AdapterUserEntity> {
    const domainUpdates: Partial<Pick<DomainUserEntity, 'name' | 'email' | 'password' | 'status'>> = {};
    if (updates.nombre !== undefined) domainUpdates.name = updates.nombre;
    if (updates.email !== undefined) domainUpdates.email = updates.email;
    if (updates.password !== undefined) domainUpdates.password = updates.password;
    if (updates.estado !== undefined) domainUpdates.status = updates.estado;

    const updatedUser = await this.authService.updateUser(id, domainUpdates);
    return this.mapper.toUserAdapter(updatedUser);
  }

  private extractTokenFromEvent(event: any, body: any): string | null {
    // Intentar obtener el token del header Authorization
    const authHeader = event?.headers?.Authorization || event?.headers?.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.replace('Bearer ', '');
    }

    // Intentar obtener el token del body
    if (body?.token) {
      return body.token;
    }

    // Intentar obtener el token de query parameters
    if (event?.queryStringParameters?.token) {
      return event.queryStringParameters.token;
    }

    return null;
  }

  private async validateTokenInRequest(event: any): Promise<TokenPayload | null> {
    try {
      const body = event?.body ? JSON.parse(event.body) : {};
      const token = this.extractTokenFromEvent(event, body);
      if (!token) {
        return null;
      }
      return await this.validateToken(token);
    } catch {
      return null;
    }
  }
}
