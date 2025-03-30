import express from 'express';
import cors from 'cors';

import { corsOptions } from './config/cors.js';
import { swaggerDocs } from './config/swagger.js';
import { ENV } from './config/env.js';

import { log } from './services/error/index.js';
import { bootstrapServices } from './init/index.js';

import scanBookRouter from './routes/scan-router.js';
import authRouter from './routes/auth-router.js';
import userRouter from './routes/user-router.js';
import bookRouter from './routes/book-router.js';
import hubRouter from './routes/hub-router.js';

import { limitTraffic } from './middlewares/limit-middleware.js';
import { throttleBlacklist } from './middlewares/blacklist-middleware.js';

const app = express();
// Enable CORS
app.use(cors(corsOptions));
// Enable body parsing
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// Enable request logging
app.use(log.httpRequest());
// Boot up app
const services = await bootstrapServices();
// Expose services to routes
app.locals.services = services;

// Apply blacklisting
app.use(throttleBlacklist);
// Apply limiting
app.use(limitTraffic);

// Routes
app.use('/api/v1', scanBookRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/books', bookRouter);
app.use('/api/v1/hubs', hubRouter);
app.use('/api/v1/users', userRouter);

swaggerDocs(app);

app.listen(ENV.PORT, () => {
  log.info(`🔓 Doors to the freereads are open on port ${ENV.PORT}`);
});

