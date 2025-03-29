import  { createClient } from 'redis';
import { ENV } from '../../config/env.js';
import { log } from '../../services/error/index.js';

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

export { redisClient, connectRedis };