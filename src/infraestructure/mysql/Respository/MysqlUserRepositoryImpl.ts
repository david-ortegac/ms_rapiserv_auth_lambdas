import { inject, injectable } from 'inversify';
import { Repository } from 'typeorm';

import { TYPES } from '../../../ioc/Types';
import { User } from '../Entity/User';
import { MysqlUserRepository } from './MysqlUserRepository';

@injectable()
export class MysqlUserRepositoryImpl implements MysqlUserRepository {
  constructor(
    @inject(TYPES.RepositoryUser)
    private readonly userRepository: Repository<User>
  ) {}

  async findById(id: number): Promise<User | null> {
    return (await this.userRepository.findOne({ where: { id } })) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return (await this.userRepository.findOne({ where: { email } })) ?? null;
  }

  async create(user: User): Promise<User> {
    return await this.userRepository.save(user);
  }

  async update(user: User): Promise<User> {
    return await this.userRepository.save(user);
  }

  async delete(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }
}
