import { inject, injectable } from 'inversify';

import { IAuthService } from '../application/services/IAuthService';
import { IAuthTokenService, TokenPayload } from '../application/services/IAuthTokenService';
import { ICypherService } from '../application/services/ICypherService';
import { InfraestructureMapperImpl } from '../infraestructure/mysql/Mapper/InfraestructureMapperImpl';
import { MysqlUserRepository } from '../infraestructure/mysql/Respository/MysqlUserRepository';
import { TYPES } from '../ioc/Types';
import { DomainUserEntity } from './Entities/DomainUserEntity';
import { LoginResponse } from './Entities/LoginResponse';

@injectable()
export class AuthServiceImpl implements IAuthService {
  constructor(
    @inject(TYPES.MysqlUserRepository)
    private readonly repository: MysqlUserRepository,
    @inject(TYPES.IInfraestructureMapper)
    private readonly mapper: InfraestructureMapperImpl,
    @inject(TYPES.ICypherService)
    private readonly cypherService: ICypherService,
    @inject(TYPES.IAuthTokenService)
    private readonly tokenService: IAuthTokenService
  ) {}

  async register(user: DomainUserEntity): Promise<DomainUserEntity> {
    const existingUser = await this.repository.findByEmail(user.email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    const encryptedPassword = this.cypherService.encrypt(user.password);
    const userWithEncryptedPassword: DomainUserEntity = {
      ...user,
      password: encryptedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const entity = this.mapper.toUserEntity(userWithEncryptedPassword);
    const createdUser = await this.repository.create(entity);
    return this.mapper.toUserDomain(createdUser);
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const user = await this.repository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const decryptedPassword = this.cypherService.decrypt(user.password);
    if (decryptedPassword !== password) {
      throw new Error('Invalid email or password');
    }

    const domainUser = this.mapper.toUserDomain(user);
    if (domainUser.status !== 'active') {
      throw new Error('User account is not active');
    }

    const token = this.tokenService.generateToken(domainUser);

    return {
      user: domainUser,
      token,
    };
  }

  async validateToken(token: string): Promise<TokenPayload> {
    return this.tokenService.verifyToken(token);
  }

  async resetPassword(email: string, oldPassword: string, newPassword: string): Promise<string> {
    const user = await this.repository.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    const decryptedPassword = this.cypherService.decrypt(user.password);
    if (decryptedPassword !== oldPassword) {
      throw new Error('Invalid old password');
    }

    const encryptedPassword = this.cypherService.encrypt(newPassword);
    const updatedUser: DomainUserEntity = {
      ...this.mapper.toUserDomain(user),
      password: encryptedPassword,
      updatedAt: new Date(),
    };

    const entity = this.mapper.toUserEntity(updatedUser);
    const savedUser = await this.repository.update(entity);
    if (!savedUser) {
      throw new Error('Failed to reset password');
    }
    return 'Password reset successfully';
  }

  async updateUser(
    id: number,
    updates: Partial<Pick<DomainUserEntity, 'name' | 'status' | 'type'>>
  ): Promise<DomainUserEntity> {
    const existingUser = await this.repository.findById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    const domainUser = this.mapper.toUserDomain(existingUser);

    const updatedUser: DomainUserEntity = {
      ...domainUser,
      name: updates.name ?? domainUser.name,
      status: updates.status ?? domainUser.status,
      type: updates.type ?? domainUser.type,
      updatedAt: new Date(),
      updatedBy: domainUser.updatedBy, // Mantener el updatedBy existente
    };

    const entity = this.mapper.toUserEntity(updatedUser);
    const savedUser = await this.repository.update(entity);
    return this.mapper.toUserDomain(savedUser);
  }
}
