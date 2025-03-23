import { rateLimit } from 'express-rate-limit';
import { slowDown } from 'express-slow-down';
import { ENV } from '../../config/env.js';
import { log } from '../../errors/index.js';
import { isAuthRoute, shouldSkipRateLimit } from './helpers.js';

/**
 * Creates a rate limiter middleware
 */
const setRateLimiter = (store) => (
    rateLimit({
        windowMs: ENV.RATE_LIMIT_WINDOW_MS,
        max: (request, response) => (
            request.user
                ? ENV.RATE_LIMIT_AUTHENTICATED
                : isAuthRoute(request.path)
                    ? ENV.RATE_LIMIT_STRICT
                    : ENV.RATE_LIMIT_DEFAULT
        ),
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (request) => {
            return request.user
                ? `user:${request.user.id}`
                : request.ip;
        },
        handler: (request, response) => {
            console.log('User in rate limiter:', request.user ? 'exists' : 'missing');
            log.warn('Throttled! The system needs a sec.', {
                ip: request.ip,
                path: request.path,
                method: request.method,
                limit: request.user
                    ? ENV.RATE_LIMIT_AUTHENTICATED
                    : isAuthRoute(request.path)
                        ? ENV.RATE_LIMIT_STRICT
                        : ENV.RATE_LIMIT_DEFAULT,
                windowMs: ENV.RATE_LIMIT_WINDOW_MS
            });
            
            response.status(429).json({
                message: 'You\'ve hit the limit. Try again in a bit'
            });
        },
        skip: shouldSkipRateLimit,
        ...(store ? { store } : {}),
    })
);

/**
 * Creates a speed limiter middleware
 */
const setSpeedLimiter = (store) => (
    slowDown({
        windowMs: ENV.SLOW_DOWN_WINDOW_MS,
        delayAfter: ENV.SLOW_DOWN_DELAY_AFTER,
        keyGenerator: (request) => {
            return request.user
                ? `user:${request.user.id}`
                : request.ip;
        },
        delayMs: (hits, request) => {
            const limit = request.user
                ? ENV.RATE_LIMIT_AUTHENTICATED
                : isAuthRoute(request.path)
                    ? ENV.RATE_LIMIT_STRICT
                    : ENV.RATE_LIMIT_DEFAULT;

            const usage = (hits / limit) * 100;

            if (usage < 60) return 0; 
            const minDelay = 100;
            const maxDelay = 800;
            const factor = (usage - 60) / 40;
            const delay = Math.min(minDelay + (maxDelay - minDelay) * factor, maxDelay);
    
            return Math.floor(delay);
        },
        maxDelayMs: 800,
        skip: shouldSkipRateLimit,
        ...(store ? { store } : {}),
    })
);

export { setRateLimiter, setSpeedLimiter };
