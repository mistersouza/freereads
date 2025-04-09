import { ENV } from './env.js';

const developmentOrigins = [
  'http://localhost:3000', // Frontend development server
  'http://localhost:5500', // Backend development server
  'http://127.0.0.1:5500', // Alternative localhost
];

const productionOrigins = [
  'https://freereads-reverse-proxy.onrender.com',
  'https://freereads-lof1.onrender.com',
  ENV.LIVE_SITE,
];

const allowedOrigins = ENV.NODE_ENV === 'production'
  ? productionOrigins
  : [...developmentOrigins, ...productionOrigins];

export const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS policy`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Rate-Limit'],
  credentials: true,
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204,
};
