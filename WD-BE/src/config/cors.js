import { ENV } from './env.js';

const allowedOrigins = ENV.CORS_ORIGIN.split(',').map(origin => origin.trim());

export const corsOptions = {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400,
};
