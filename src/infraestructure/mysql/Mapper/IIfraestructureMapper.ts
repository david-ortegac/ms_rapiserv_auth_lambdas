import { DomainUserEntity } from '../../../domain/Entities/DomainUserEntity';
import { User } from '../Entity/User';

export interface IInfraestructureMapper {
  toUserDomain(entity: User): DomainUserEntity;
  toUserEntity(domain: DomainUserEntity): User;
  toUserDomainList(entityList: User[]): DomainUserEntity[];
  toUserEntityList(domainList: DomainUserEntity[]): User[];
}
