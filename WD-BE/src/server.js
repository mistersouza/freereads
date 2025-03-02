import express from 'express';

import { ENV } from '../config/env.js';

const app = express();

app.listen(ENV.PORT, () => {
  console.log(`🔓 Doors to the freereads are open on port ${ENV.PORT}`);
});