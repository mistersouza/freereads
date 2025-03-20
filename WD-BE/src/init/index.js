import { connectDB } from './db.js';
import { connectRedis } from './redis.js';
import { setRemoteStore } from '../init/redis.js';
import { log } from '../errors/index.js';
import { setRateLimiter, setSpeedLimiter } from '../middlewares/rate-limiter-middleware.js';


/**
 * Initializes the application by connecting to the database and Redis,
 * setting up the remote store, and configuring rate and speed limiters.
 * 
 * @returns {Array} An array of configured rate and speed limiters
 * @throws {Error} Logs any initialization errors and exits the process
 */
const kickstart = async () => {
    try {
        await connectDB();
        await connectRedis();
        const { store } = setRemoteStore();

        return [ setSpeedLimiter(store), setRateLimiter(store) ];
    } catch (error) {
        log.error(error);
        // TODO: Streamline error handling into a unified system across the app
        process.exit(1);
    }
};

export { kickstart };
