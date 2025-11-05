import { inject, injectable } from 'inversify';

import { IAuthService } from '../../../../application/services/IAuthService';
import { TYPES } from '../../../../ioc/Types';
import { AuthController } from './AuthController';
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
          const loggedInUser = await this.login(body.email, body.password);
          return {
            statusCode: 200,
            body: JSON.stringify(loggedInUser),
          };
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

  async login(email: string, password: string): Promise<AdapterUserEntity> {
    const loggedInUser = await this.authService.login(email, password);
    return this.mapper.toUserAdapter(loggedInUser);
  }

  async resetPassword(email: string, newPassword: string): Promise<AdapterUserEntity> {
    const updatedUser = await this.authService.resetPassword(email, newPassword);
    return this.mapper.toUserAdapter(updatedUser);
  }
}
