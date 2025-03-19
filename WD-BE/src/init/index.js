import { connectDB } from './db.js';
import { connectRedis } from './redis.js';
import { initializeLimiter } from '../middlewares/rate-limiter-middleware.js';
import { log } from '../errors/index.js';


const kickstart = async () => {
    try {
        await connectDB();
        await connectRedis();
        return initializeLimiter();
    } catch (error) {
        log.error(error);
        // TODO: Streamline error handling into a unified system across the app
        process.exit(1);
    }
};

export { kickstart };
