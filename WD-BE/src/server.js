import express from 'express';
import cors from 'cors';
import morgan from 'morgan';  


import { ENV } from './config/env.js';
import { corsOptions } from './config/cors.js';
import connectDB from './config/db.js';

import scanBookRouter from './routes/scan-router.js';

const app = express();
// Enable request logging
app.use(morgan('dev'));
// Enable CORS with imported config options
app.use(cors(corsOptions));
// Enable body parsing
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

connectDB();

// Routes
app.use('/api/v1', scanBookRouter);

app.listen(ENV.PORT, () => {
  console.log(`🔓 Doors to the freereads are open on port ${ENV.PORT}`);
});