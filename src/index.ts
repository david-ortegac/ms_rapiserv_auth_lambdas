import 'reflect-metadata';

import { AuthController } from './adapter/restful/v1/controller/AuthController';
import { AppDataSource } from './infraestructure/mysql/data-source';
import { container } from './ioc/inversify.config';
import { TYPES } from './ioc/Types';

// Variables globales para reutilización entre invocaciones
let isDataSourceInitialized = false;
let controller: AuthController;

export const handler = async (event: any) => {
  console.log('event', event);
  try {
    // Inicializar DataSource solo una vez (reutilización de contenedor)
    if (!isDataSourceInitialized) {
      console.log('Inicializando DataSource...');
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }
      isDataSourceInitialized = true;
      console.log('DataSource inicializado');
    }

    console.log('Resolviendo dependencias...');
    controller = container.get<AuthController>(TYPES.AuthController);
    console.log('Dependencias resueltas');

    // Procesar la petición
    const result = await controller.handleRequest(event);
    console.log('result', result);
    return result;
  } catch (error) {
    console.error('Error in handler:', error);
    return {
      statusCode: 500,
      body: {
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
};
