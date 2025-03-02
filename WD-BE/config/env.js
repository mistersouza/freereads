import { config } from 'dotenv';

config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

export const ENV = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 5500,
    MONGODB_URI: process.env.MONGODB_URI,
    GOOGLE_CREDENTIALS: process.env.GOOGLE_CREDENTIALS,
};

const requiredEnvVariables = [
    'MONGODB_URI',
];

for (const envVariable of requiredEnvVariables) {
    if (!ENV[envVariable]) {
        throw new Error(`Critical Error: ${envVariable} is MIA! Add it or face the consequences.`);
    }
}