import { createClient } from 'redis';
import { RedisStore } from 'rate-limit-redis';
import { ENV } from '../config/env.js';
import { log } from '../errors/index.js';

/**
 * Creates a Redis client with a configurable reconnection strategy.
 * Uses the Redis URL from environment configuration and sets a custom
 * socket reconnection strategy that exponentially backs off with a maximum delay.
 */
const redisClient = createClient({
    url: ENV.REDIS_URL,
    socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 2000),
    }
});

redisClient.on('error', (error) => log.error(error));
redisClient.on('connect', () => log.info('Redis is locked and loaded!'));
redisClient.on('reconnecting', () => log.info('Redis lost signal... dialing back in!'));

/**
 * Establishes a connection to the Redis server.
 * Attempts to connect if the client is not already open.
 * 
 * @returns {Promise<string>} Connection status - 'connected' or 'reconnecting'
 */
const connectRedis = async () => {
    log.info(`Trying to link up with Redis at ${ENV.REDIS_URL}... Fingers crossed!`);
    if (!redisClient.isOpen) {
        try {
            log.info('Attempting to connect to Redis...');
            await redisClient.connect();
        } catch (error) {
            log.error(error);
            // TODO: Streamline error handling into a unified system across the app
        }
    }
    return redisClient.isReady ? 'connected' : 'reconnecting';
};

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


export { redisClient, connectRedis, setRemoteStore };