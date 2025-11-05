import { DomainUserEntity } from '../../../../../domain/Entities/DomainUserEntity';
import { AdapterUserEntity, StatusUser, TypeUser } from '../Entity/AdapterUserEntity';
import { IAdapterMapper } from './IAdapterMapper';

export class AdapterMapperImpl implements IAdapterMapper {
  toUserDomain(adapterEntity: AdapterUserEntity): DomainUserEntity {
    return {
      id: adapterEntity.id,
      name: adapterEntity.nombre,
      email: adapterEntity.email,
      password: adapterEntity.password,
      status: adapterEntity.estado as string,
      type: adapterEntity.tipo as string,
      createdAt: adapterEntity.fechaCreacion,
      updatedAt: adapterEntity.fechaActualizacion,
      createdBy: adapterEntity.creadoPor,
      updatedBy: adapterEntity.actualizadoPor,
    };
  }

  toUserAdapter(domainEntity: DomainUserEntity): AdapterUserEntity {
    return {
      id: domainEntity.id,
      nombre: domainEntity.name,
      email: domainEntity.email,
      password: domainEntity.password,
      estado: domainEntity.status as StatusUser,
      tipo: domainEntity.type as TypeUser,
      fechaCreacion: domainEntity.createdAt,
      fechaActualizacion: domainEntity.updatedAt,
      creadoPor: domainEntity.createdBy,
      actualizadoPor: domainEntity.updatedBy,
    };
  }

  toUserDomainList(adapterList: AdapterUserEntity[]): DomainUserEntity[] {
    return adapterList.map((adapter) => this.toUserDomain(adapter));
  }

  toUserAdapterList(domainList: DomainUserEntity[]): AdapterUserEntity[] {
    return domainList.map((domain) => this.toUserAdapter(domain));
  }
}
