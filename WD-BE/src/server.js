import express from 'express';

import { ENV } from '../config/env.js';
import connectDB from '../config/db.js';

const app = express();
/// Connect to MongoDB
connectDB();

app.listen(ENV.PORT, () => {
  console.log(`🔓 Doors to the freereads are open on port ${ENV.PORT}`);
});