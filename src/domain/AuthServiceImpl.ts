import { inject, injectable } from 'inversify';

import { IAuthService } from '../application/services/IAuthService';
import { ICypherService } from '../application/services/ICypherService';
import { InfraestructureMapperImpl } from '../infraestructure/mysql/Mapper/InfraestructureMapperImpl';
import { MysqlUserRepository } from '../infraestructure/mysql/Respository/MysqlUserRepository';
import { TYPES } from '../ioc/Types';
import { DomainUserEntity } from './Entities/DomainUserEntity';

@injectable()
export class AuthServiceImpl implements IAuthService {
  constructor(
    @inject(TYPES.MysqlUserRepository)
    private readonly repository: MysqlUserRepository,
    @inject(TYPES.IInfraestructureMapper)
    private readonly mapper: InfraestructureMapperImpl,
    @inject(TYPES.ICypherService)
    private readonly cypherService: ICypherService
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

  async login(email: string, password: string): Promise<DomainUserEntity> {
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

    return domainUser;
  }

  async resetPassword(email: string, newPassword: string): Promise<DomainUserEntity> {
    const user = await this.repository.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    const encryptedPassword = this.cypherService.encrypt(newPassword);
    const updatedUser: DomainUserEntity = {
      ...this.mapper.toUserDomain(user),
      password: encryptedPassword,
      updatedAt: new Date(),
    };

    const entity = this.mapper.toUserEntity(updatedUser);
    const savedUser = await this.repository.update(entity);
    return this.mapper.toUserDomain(savedUser);
  }
}
