import express from 'express';
import cors from 'cors';

import { ENV } from './config/env.js';
import { corsOptions } from './config/cors.js';
import { swaggerDocs } from './config/swagger.js';
import { log } from './errors/index.js';
import { kickstart } from './init/index.js';

import scanBookRouter from './routes/scan-router.js';
import authRouter from './routes/auth-router.js';
import userRouter from './routes/user-router.js';
import bookRouter from './routes/book-router.js';
import hubRouter from './routes/hub-router.js';

const app = express();
// Enable CORS
app.use(cors(corsOptions));
// Enable body parsing
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// Enable request logging
app.use(log.httpRequest());
// Enable Swagger docs
swaggerDocs(app);
// Boot up app
const services = await kickstart();
// Expose services to routes
app.locals.services = services;

// Apply limiting
app.use(services.speedLimiter);
app.use(services.rateLimiter);

// Routes
app.use('/api/v1', scanBookRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/books', bookRouter);
app.use('/api/v1/hubs', hubRouter);
app.use('/api/v1/users', userRouter);

app.listen(ENV.PORT, () => {
  log.info(`🔓 Doors to the freereads are open on port ${ENV.PORT}`);
});

