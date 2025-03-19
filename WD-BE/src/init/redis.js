import { createClient } from 'redis';
import { RedisStore } from 'rate-limit-redis';
import { ENV } from '../config/env.js';
import { log } from '../errors/index.js';

const redisClient = createClient({
    url: ENV.REDIS_URL,
    socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 2000),
    }
});

redisClient.on('error', (error) => log.error(error));
redisClient.on('connect', () => log.info('Redis is locked and loaded!'));
redisClient.on('reconnecting', () => log.info('Redis lost signal... dialing back in!'));

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

const setRemoteStore = () => {
    let isSet = false;
    let remoteStore = null;

    log.info('Powering up Redis—remote rate limiter incoming...');
    if (!redisClient.isReady) {
        log.warn('Redis reconnecting... local store\'s up!');
        return { isSet, remoteStore };
    }

    log.info('Redis is live! Wiring up the rate limiter...');
    const redisStore = new RedisStore({
                sendCommand: async (command, ...args) => {
                    try {
                        return await redisClient.sendCommand([command, ...args]);
                    } catch (error) {
                        log.error(error);
                        // TODO: Streamline error handling into a unified system across the app
                    }
                },
                prefix: 'rate-limit',
            });
        
    if (typeof redisStore.increment === 'function') {
        log.info('Remote store is all set—throttling in style!');
        return { isSet: true, remoteStore: redisStore };
    }

    return { isSet, remoteStore };
    
};

export { redisClient, connectRedis, setRemoteStore };