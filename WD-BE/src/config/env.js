import { config } from 'dotenv';

config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

export const ENV = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 5500,
    MONGODB_URI: process.env.MONGODB_URI,
    GOOGLE_CREDENTIALS: process.env.GOOGLE_CREDENTIALS,
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    RATE_LIMIT_MIN: parseInt(process.env.RATE_LIMIT_MIN) || 10,
    RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX) || 100,    
    LOCAL_IPS: process.env.LOCAL_IPS || '::1,127.0.0.1',
};

/**
 * If any of these variables are missing, an error will be thrown.
 */
const requiredEnvVariables = [
    'MONGODB_URI',
    'GOOGLE_CREDENTIALS',
    'JWT_SECRET',
];

for (const envVariable of requiredEnvVariables) {
    if (!ENV[envVariable]) {
        throw new Error(`Critical Error: ${envVariable} is MIA! Add it or face the consequences.`);
    }
}