import express from 'express';
import cors from 'cors';


import { ENV } from './config/env.js';
import { corsOptions } from './config/cors.js';
import connectDB from './config/db.js';

import scanBookRouter from './routes/scan-router.js';

const app = express();

// Enable CORS with imported config options
app.use(cors(corsOptions));
// Middlewares for parsing request bodies
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

connectDB();

app.listen(ENV.PORT, () => {
  console.log(`🔓 Doors to the freereads are open on port ${ENV.PORT}`);
});