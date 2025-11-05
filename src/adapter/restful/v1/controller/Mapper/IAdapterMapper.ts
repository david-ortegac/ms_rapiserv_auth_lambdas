import { DomainUserEntity } from '../../../../../domain/Entities/DomainUserEntity';
import { AdapterUserEntity } from '../Entity/AdapterUserEntity';

export interface IAdapterMapper {
  toUserDomain(adapterEntity: AdapterUserEntity): DomainUserEntity;
  toUserAdapter(domainEntity: DomainUserEntity): AdapterUserEntity;
  toUserDomainList(adapterList: AdapterUserEntity[]): DomainUserEntity[];
  toUserAdapterList(domainList: DomainUserEntity[]): AdapterUserEntity[];
}
