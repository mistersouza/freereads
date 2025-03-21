import { connectDB } from '../infrastructure/database/index.js';
import { log } from '../errors/index.js';
import { connectRedis, setRemoteStore } from '../infrastructure/redis/index.js';
import { initializeRequestControl } from '../services/request-control/index.js';
import { initializeBookFinder } from '../services/book/index.js';

/**
 * Initializes core services for the application, including Redis connection and rate limiting.
 * 
 * @returns {Promise<{rateLimiter: object, speedLimiter: object}>} An object containing configured rate limiters
 * @throws {Error} Throws an error if service initialization fails
 */
const initializeServices = async () => {
    try {
        // Connect to MongoDB
        await connectDB();
        // Connect to Redis
        await connectRedis();
        
        // Create remote store for rate limiting
        const store = setRemoteStore()?.store || null;

        // Initialize request control services
        return {
            ...initializeRequestControl(store),
            ...initializeBookFinder(),
        };
    } catch (error) {
        log.error(error);
        // Todo - Add error handling
    }
};

export { initializeServices };