import fs from 'fs';
import { config } from 'dotenv';
import { log } from '../services/error/logger.js';

config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

if (process.env.GOOGLE_CREDENTIALS_BASE64) {
  try {
    const credentials = Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, 'base64').toString('utf-8');
    fs.writeFileSync('./src/config/google-credentials.json', credentials);
    log.info('Google credentials file created from environment variable');
    // Set the path to the credentials file
    process.env.GOOGLE_CREDENTIALS = './src/config/google-credentials.json';
  } catch (error) {
    log.error(error);
  }
}

export const ENV = {
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  // Server
  PORT: process.env.PORT || 5500,
  // Live site
  LIVE_SITE: process.env.LIVE_SITE || 'https://freereads-reverse-proxy.onrender.com',
  // MongoDB
  MONGODB_URI: process.env.MONGODB_URI,
  // Google Cloud
  GOOGLE_CREDENTIALS: process.env.GOOGLE_CREDENTIALS,
  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  // Authentication
  JWT_PREFIX: process.env.JWT_PREFIX || 'jwt',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES_IN: parseInt(process.env.JWT_ACCESS_EXPIRES_IN, 10) || 15 * 60,
  JWT_REFRESH_EXPIRES_IN: parseInt(process.env.JWT_REFRESH_EXPIRES_IN, 10) || 7 * 24 * 60 * 60,
  // Rate limiting
  TRUSTED_IPS: process.env.TRUSTED_IPS || '::1,127.0.0.1',
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  RATE_LIMIT_STRICT: parseInt(process.env.RATE_LIMIT_STRICT, 10) || 10,
  RATE_LIMIT_DEFAULT: parseInt(process.env.RATE_LIMIT_DEFAULT, 10) || 100,
  RATE_LIMIT_AUTHENTICATED: parseInt(process.env.RATE_LIMIT_AUTHENTICATED, 10) || 150,
  // Speed limiting
  SLOW_DOWN_WINDOW_MS: parseInt(process.env.SLOW_DOWN_WINDOW_MS, 10) || 15 * 60 * 1000,
  SLOW_DOWN_DELAY_AFTER: parseInt(process.env.SLOW_DOWN_DELAY_AFTER, 10) || 60,
  SLOW_DOWN_DELAY_MS: parseInt(process.env.SLOW_DOWN_DELAY_MS, 10) || 1000,
  // Blacklist
  BLACKLIST_PREFIX: process.env.BLACKLIST_PREFIX || 'blacklist',
  BLACKLIST_DURATION: parseInt(process.env.BLACKLIST_DURATION, 10) || 24 * 60 * 60,
  MAX_LOGIN_ATTEMPTS: parseInt(process.env.MAX_LOGIN_ATTEMPTS, 10) || 3,
  MAX_API_ABUSE: parseInt(process.env.MAX_API_ABUSE, 10) || 1000,
  ATTEMPT_RESET_TIME: parseInt(process.env.ATTEMPT_RESET_TIME, 10) || 3600,
  // Redis
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  REDIS_ENABLED: process.env.REDIS_ENABLED === 'true',
};

/**
 * If any of these variables are missing, an error will be thrown.
 */
const requiredEnvVariables = [
  'MONGODB_URI',
  'GOOGLE_CREDENTIALS',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'REDIS_URL',
];

requiredEnvVariables.forEach((envVariable) => {
  if (!ENV[envVariable]) {
    throw new Error(`Critical Error: ${envVariable} is MIA! Add it or face the consequences.`);
  }
});
