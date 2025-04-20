import { connectDB } from '../infrastructure/database/index.js';
import { connectRedis, setRemoteStore } from '../infrastructure/redis/index.js';
import { initializeRequestControl } from '../services/request-control/index.js';
import { initializeUserService } from '../services/user/index.js';
import { initializeBlacklist } from '../services/blacklist/index.js';
import { initializeBookService } from '../services/book/index.js';
import { initializeHubService } from '../services/hub/index.js';
import { initializeJwtService } from '../services/jwt/index.js';

/**
 * Spins up the backbone services
 *
 * @returns {Promise<{rateLimiter, speedLimiter}>} Configured services object.
 * @throws {Error} Throws an error if service initialization fails
 */
const initializeServices = async () => {
  // Connect to MongoDB
  await connectDB();
  // Connect to Redis
  await connectRedis();
  // Create remote store for rate limiting
  const store = setRemoteStore()?.store || null;

  // Initialize core services
  return {
    blacklist: await initializeBlacklist(),
    book: initializeBookService(),
    hub: initializeHubService(),
    jwt: initializeJwtService(),
    requestControl: initializeRequestControl(store),
    user: initializeUserService(),
  };
};

export { initializeServices };
