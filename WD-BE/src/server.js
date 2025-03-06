import express from 'express';
import cors from 'cors';
import morgan from 'morgan';  


import { ENV } from './config/env.js';
import { corsOptions } from './config/cors.js';
import { swaggerDocs } from './config/swagger.js';
import connectDB from './config/db.js';

import scanBookRouter from './routes/scan-router.js';
import authRouter from './routes/auth-router.js';
import userRouter from './routes/user-router.js';
import bookRouter from './routes/book-router.js';

const app = express();
// Enable request logging
app.use(morgan('dev'));
// Enable CORS with imported config options
app.use(cors(corsOptions));
// Enable body parsing
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// Enable Swagger docs
swaggerDocs(app);

// Connect to the database
connectDB();

// Routes
app.use('/api/v1', scanBookRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/books', bookRouter);

app.listen(ENV.PORT, () => {
  console.log(`🔓 Doors to the freereads are open on port ${ENV.PORT}`);
});