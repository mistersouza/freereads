import { RedisStore } from 'rate-limit-redis';
import { log } from '../../services/error/index.js';
import { redisClient } from './client.js';

/**
 * Creates a Redis store for rate limiting with error handling and connection validation.
 * 
 * @returns {RedisStore|null} A configured RedisStore for rate limiting if Redis is ready and valid, otherwise null
 */
const setRemoteStore = () => {
    if (!redisClient.isReady) {
        log.warn('Redis reconnecting... local store\'s up!');
        return null;
    }

    log.info('Redis is live! Wiring up the rate limiter...');
    const redisStore = new RedisStore({
        sendCommand: async (command, ...args) => {
            try {
                return await redisClient.sendCommand([command, ...args]);
            } catch (error) {
                log.error(error); // Simplified error handling
            }
        },
        prefix: 'rate-control',
    });

    if (typeof redisStore.increment === 'function') {
        log.info('Remote store is all set—throttling in style!');
        return redisStore;
    }

    return null;
};

export { setRemoteStore };