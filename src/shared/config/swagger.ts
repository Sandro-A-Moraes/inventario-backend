import type {Options} from 'swagger-jsdoc';

export const swaggerOptions: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Inventário Backend API',
      version: '1.0.0',
        description: 'API para gerenciamento de inventário, incluindo autenticação e controle de acesso.',
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Servidor de desenvolvimento',
      },
    ],
  },
  apis: ['./src/modules/**/routes/*.ts'],
};
