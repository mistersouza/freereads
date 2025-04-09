import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { ENV } from './env.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FreeReads API',
      version: '1.0.0',
      description: 'API documentation for the FreeReads book sharing platform',
      contact: {
        name: 'API Support',
        url: 'https://github.com/mistersouza/freereads',
      },
    },
    servers: [
      {
        url: ENV.NODE_ENV === 'production'
          ? 'https://freereads-reverse-proxy.onrender.com'
          : `http://localhost:${ENV.PORT}`,
        description: ENV.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
      {
        url: ENV.NODE_ENV === 'production'
          ? 'https://freereads-lof1.onrender.com'
          : `http://localhost:${ENV.PORT}`,
        description: ENV.NODE_ENV === 'production' ? 'Direct backend server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    externalDocs: {
      description: 'Find out more about FreeReads',
      url: 'https://github.com/mistersouza/freereads',
    },
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js',
    './src/models/*.js',
  ],
};

const specs = swaggerJsdoc(options);

const swaggerDocs = (app) => {
  const uiOptions = {
    swaggerOptions: {
      persistAuthorization: true,
      defaultModelsExpandDepth: -1,
      tryItOutEnabled: true,
      displayRequestDuration: true,
      filter: true,
    },
    customCss: '.swagger-ui .topbar { background-color:rgb(50, 51, 53); } .swagger-ui .info .title { color: #3f51b5; } .swagger-ui .btn.execute { background-color: #4CAF50; }',
    customSiteTitle: 'FreeReads API Documentation',
  };

  // Serve Swagger JSON
  app.get('/api-docs.json', (request, response) => {
    response.setHeader('Content-Type', 'application/json');
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.send(specs);
  });

  // Serve Swagger UI
  app.use('/', swaggerUi.serve, swaggerUi.setup(specs, uiOptions));
};

export { swaggerDocs };
