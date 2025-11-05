import { DomainUserEntity } from '../../../domain/Entities/DomainUserEntity';
import { User } from '../Entity/User';
import { IInfraestructureMapper } from './IIfraestructureMapper';

export class InfraestructureMapperImpl implements IInfraestructureMapper {
  toUserDomain(entity: User): DomainUserEntity {
    return {
      id: entity.id,
      name: entity.name,
      email: entity.email,
      password: entity.password,
      status: entity.status,
      type: entity.type,
      createdAt: entity.created_at,
      updatedAt: entity.updated_at,
      createdBy: entity.created_by,
      updatedBy: entity.updated_by,
    };
  }

  toUserEntity(domain: DomainUserEntity): User {
    return {
      id: domain.id,
      name: domain.name,
      email: domain.email,
      password: domain.password,
      status: domain.status,
      type: domain.type,
      created_at: domain.createdAt,
      updated_at: domain.updatedAt,
      created_by: domain.createdBy,
      updated_by: domain.updatedBy,
    } as User;
  }

  toUserDomainList(entityList: User[]): DomainUserEntity[] {
    return entityList.map((entity) => this.toUserDomain(entity));
  }

  toUserEntityList(domainList: DomainUserEntity[]): User[] {
    return domainList.map((domain) => this.toUserEntity(domain));
  }
}
