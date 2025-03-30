import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { ENV } from './env.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'freereads API',
      version: '1.0.0',
      description: 'API documentation'
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://freereads-lof1.onrender.com' 
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
    },
    customCss: '.swagger-ui .topbar { background-color:rgb(50, 51, 53); } .swagger-ui .info .title { color: #3f51b5; } .swagger-ui .btn.execute { background-color: #4CAF50; }',
    customSiteTitle: "Free Reads API Documentation",
    customfavIcon: "https://example.com/favicon.ico"
  };
  
  app.use('/', swaggerUi.serve, swaggerUi.setup(specs, uiOptions));
};

export { swaggerDocs };