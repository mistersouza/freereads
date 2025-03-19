import { rateLimit } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { isIP } from 'net';
import { ENV } from '../config/env.js';
import { log } from '../errors/index.js';
import { redisClient, connectRedis, setRemoteStore } from '../init/redis.js';

/**
 * Rate Limiter Middleware
 * 
 * This middleware implements request rate limiting for the Express application to prevent
 * abuse and protect against brute force attacks. It uses the express-rate-limit package
 * with optional Redis-backed storage for distributed environments.
 * 
 * Configuration:
 * - windowMs: Time window in milliseconds during which requests are counted (from ENV.RATE_LIMIT_WINDOW_MS)
 * - max: Maximum number of requests allowed within the window, varies by route type:
 *   - Auth routes (/api/v1/auth/*): Lower limit (ENV.RATE_LIMIT_MIN) to prevent brute force attacks
 *   - Other routes: Higher limit (ENV.RATE_LIMIT_MAX) for normal API usage
 * - standardHeaders: Adds standard rate limit headers (X-RateLimit-*)
 * - legacyHeaders: Disables legacy rate limit headers
 * 
 * Redis Integration:
 * - When ENV.REDIS_ENABLED is true, uses Redis as a backing store for rate limiting
 * - Automatically falls back to memory store if Redis is unavailable or disabled
 * - Uses the rate-limit-redis package to integrate with Redis
 * - Validates Redis store functionality before applying it
 * 
 * Behavior:
 * - When a client exceeds their rate limit, returns a 429 status with a custom message
 * - Local development IPs (specified in ENV.LOCAL_IPS) bypass rate limiting
 * - Different error messages for auth routes vs. regular routes
 * - Comprehensive logging for rate limit events and Redis connectivity
 * 
 * Environment Variables:
 * - RATE_LIMIT_WINDOW_MS: Time window in milliseconds (default: 15 minutes)
 * - RATE_LIMIT_MIN: Request limit for auth routes
 * - RATE_LIMIT_MAX: Request limit for other routes
 * - LOCAL_IPS: Comma-separated list of IP addresses to skip rate limiting
 * - REDIS_ENABLED: Boolean flag to enable/disable Redis integration
 * 
 * @module middlewares/rate-limiter-middleware
 */

/**
 * Scanning for authentication routes
 * 
 * @param {string} path - The request path
 * @returns {boolean} True if the path is an auth route
 */
const isAuthRoute = (path) => /^\/api\/v1\/auth\/?.*$/i.test(path);

/**
 *  Whitelisting IPs for rate limit bypass
 * 
 * @param {Object} request - The request IP address
 * @returns {boolean} True if rate limiting should be skipped
 */
const shouldSkipRateLimit = (request) => {
    try {
        if (!request.ip) {
            log.warn('IP address is MIA');
            return false;
        }

        if (!isIP(request.ip)) {
            log.warn(`IP address: ${request.ip} seems off :/`);
            return false;
        }

        const localIps = new Set(
            ENV.LOCAL_IPS
                .split(',')
                .map(ip => ip.trim())
                .filter(ip => Boolean(ip.length))
        );

        return localIps.has(request.ip);
    } catch (error) {
        log.error(error);
        // TODO: Streamline error handling into a unified system across the app
        return false;
    }
};

/**
 * Rate limiter settings: Let’s dial in the throttle
 * 
 * This object configures the behavior of the express-rate-limit middleware.
 * It defines how requests are counted, limited, and what happens when limits are exceeded.
 * 
 * @property {number} windowMs - Time window in milliseconds during which requests are counted
 * @property {Function} max - Dynamic function that returns different limits based on route type:
 *                           lower limits for auth routes to prevent brute force attacks,
 *                           higher limits for regular API routes
 * @property {boolean} standardHeaders - When true, adds standard rate limit headers (X-RateLimit-*)
 * @property {boolean} legacyHeaders - When false, disables deprecated rate limit headers
 * @property {Function} handler - Custom response handler when rate limit is exceeded,
 *                               provides different messages for auth vs. regular routes
 * @property {Function} skip - Function to determine if rate limiting should be bypassed,
 *                            typically used for whitelisting development IPs
 */
const limiterOptions = {
    // Time window for counting requests (defaults to 15 minutes if not specified)
    windowMs: ENV.RATE_LIMIT_WINDOW_MS,
    // Dynamic request limit based on route path
    max: (request, response) => isAuthRoute(request.path)
        ? ENV.RATE_LIMIT_MIN
        : ENV.RATE_LIMIT_MAX,
    
    // Enable standard rate limit headers (X-RateLimit-*)
    standardHeaders: true,
    // Disable legacy rate limit headers
    legacyHeaders: false,
    // Custom handler for rate limit exceeded
    handler: (request, response) => {
        const isAuth = isAuthRoute(request.path);

        log.warn('Throttled! The system needs a sec.', {
            ip: request.ip,
            path: request.path,
            method: request.method,
            limit: isAuth ? ENV.RATE_LIMIT_MIN : ENV.RATE_LIMIT_MAX,
            windowMs: ENV.RATE_LIMIT_WINDOW_MS
        });
        
        response.status(429).json({
            message: isAuth
                ? 'Easy, hacker! Limit reached. Try later.' 
                : 'You\'ve hit the limit. Try again in a bit'
        });

    },
    // Skip rate limiting for local development IPs
    skip: (request) => shouldSkipRateLimit(request),
};

/**
 * Booting up rate limiter with custom store settings
 * 
 * @returns {Function} Configured rate limiting middleware
 * @description Attempts to use Redis store if enabled, falls back to local memory store
 */
const initializeLimiter = () => {
    if (!ENV.REDIS_ENABLED) {
        log.info('Rate limiter running on local store');
        return rateLimit(limiterOptions);
    }

    const { isSet, remoteStore } = setRemoteStore();
    if (isSet) {
        limiterOptions.store = remoteStore;
        return rateLimit(limiterOptions);
    }
    
    log.info('Fallback mode: Local store taking over!');
    return rateLimit(limiterOptions);
};

export { initializeLimiter };