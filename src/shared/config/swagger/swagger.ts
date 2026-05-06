import type {Options} from 'swagger-jsdoc';

const baseUrl = process.env.BASE_URL || 'http://localhost:3000/api/v1';

export const swaggerOptions: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Inventário Backend API',
      version: '1.0.0',
      description:
        'API para gerenciamento de inventário, incluindo autenticação e controle de acesso.',
    },
    servers: [
      {
        url: baseUrl,
        description: 'Servidor de produção',
      },
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Servidor de desenvolvimento local',
      },
    ],
  },
  apis: ['./src/modules/**/routes/*.ts'],
};
