import mongoose from 'mongoose';
import { log } from '../../errors/index.js';
import { ENV } from '../../config/env.js';

const connectDB = async () => {
    try {
        await mongoose.connect(ENV.MONGODB_URI);
        log.info(`🚀 MongoDB is live, in ${ENV.NODE_ENV} mode! Ready to roll`);
    } catch (error) {
        log.error(error);
        // TODO: Streamline error handling into a unified system across the app
    }
};

export { connectDB };