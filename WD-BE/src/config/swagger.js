import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { ENV } from './env.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Free Reads API',
      version: '1.0.0',
      description: 'FreeReads API documentation'
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://api.freereads.com' 
          : process.env.PORT || 'http://localhost:5500',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    externalDocs: {
      description: 'Find out more about Free Reads',
      url: 'https://github.com/mistersouza/freereads'
    }
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js', './src/models/*.js']
};

const specs = swaggerJsdoc(options);

const swaggerDocs = (app) => {
  const uiOptions = {
    swaggerOptions: {
      persistAuthorization: true,
      defaultModelsExpandDepth: -1
    }
  };
  
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, uiOptions));
  
  console.log(`Swagger docs available at /api-docs`);
};

export { swaggerDocs };