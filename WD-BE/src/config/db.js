import mongoose from 'mongoose';
import { log } from '../errors/index.js';
import { ENV } from './env.js';

export default async () => {
    try {
        await mongoose.connect(ENV.MONGODB_URI);
        log.info(`🚀 MongoDB is live, in ${ENV.NODE_ENV} mode! Ready to roll`);
    } catch (error) {
        log.error(error);
        // Exit process if db connection fails
        process.exit(1);
    }
};