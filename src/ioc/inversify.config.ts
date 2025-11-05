import { Container } from 'inversify';
import { Repository } from 'typeorm';

import { AuthController } from '../adapter/restful/v1/controller/AuthController';
import { AuthControllerImpl } from '../adapter/restful/v1/controller/AuthControllerImpl';
import { AdapterMapperImpl } from '../adapter/restful/v1/controller/Mapper/AdapterMapperImpl';
import { IAdapterMapper } from '../adapter/restful/v1/controller/Mapper/IAdapterMapper';
import { IAuthService } from '../application/services/IAuthService';
import { ICypherService } from '../application/services/ICypherService';
import { AuthServiceImpl } from '../domain/AuthServiceImpl';
import { CypherServiceImpl } from '../domain/CypherServiceImpl';
import { AppDataSource } from '../infraestructure/mysql/data-source';
import { User } from '../infraestructure/mysql/Entity/User';
import { IInfraestructureMapper } from '../infraestructure/mysql/Mapper/IIfraestructureMapper';
import { InfraestructureMapperImpl } from '../infraestructure/mysql/Mapper/InfraestructureMapperImpl';
import { MysqlUserRepository } from '../infraestructure/mysql/Respository/MysqlUserRepository';
import { MysqlUserRepositoryImpl } from '../infraestructure/mysql/Respository/MysqlUserRepositoryImpl';
import { TYPES } from './Types';

const container = new Container();

// Función factory para el Repository de User
const createUserRepository = (): Repository<User> => {
  return AppDataSource.getRepository(User);
};

// Configurar DataSource
container.bind(TYPES.DataSource).toConstantValue(AppDataSource);

// Configurar Repositories
container.bind<Repository<User>>(TYPES.RepositoryUser).toDynamicValue(createUserRepository);

// Configurar Services
container.bind<IAuthService>(TYPES.AuthService).to(AuthServiceImpl);

// Configurar Repositories
container.bind<MysqlUserRepository>(TYPES.MysqlUserRepository).to(MysqlUserRepositoryImpl);

// Configurar Mappers
container.bind<IInfraestructureMapper>(TYPES.IInfraestructureMapper).to(InfraestructureMapperImpl);
container.bind<IAdapterMapper>(TYPES.IAdapterMapper).to(AdapterMapperImpl);

// Configurar Controllers
container.bind<AuthController>(TYPES.AuthController).to(AuthControllerImpl);

// Configurar Cypher Service
container.bind<ICypherService>(TYPES.ICypherService).to(CypherServiceImpl);

export { container };
