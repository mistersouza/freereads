import mongoose from 'mongoose';
import { ENV } from './env.js';


export default async () => {
    try {
        await mongoose.connect(ENV.MONGODB_URI);
        console.log(`🚀 MongoDB is live, in ${ENV.NODE_ENV} mode! Ready to roll!`);
    } catch (error) {
        console.error('🚨 Alert! MongoDB is not responding', error);
        // Exit process if db connection fails
        process.exit(1);
    }
}