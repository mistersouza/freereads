import { rateLimit } from 'express-rate-limit';
import { slowDown } from 'express-slow-down';
import { RedisStore } from 'rate-limit-redis';
import { isIP } from 'net';
import { ENV } from '../config/env.js';
import { log } from '../errors/index.js';
import { redisClient, connectRedis } from '../init/redis.js';

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
 * Configures a rate limiter middleware to control request frequency
 * based on route type and prevent potential abuse.
 * 
 * @param {Object} [store] - Optional store for tracking request metrics
 * @returns {Function} A middleware function that applies rate limiting
 * @property {number} windowMs - Time window for tracking request frequency
 * @property {Function} max - Dynamic request limit based on route authentication status
 * @property {boolean} standardHeaders - Enables standard rate limit response headers
 * @property {Function} handler - Custom response for rate limit violations
 * @property {Function} skip - Function to bypass rate limiting for specific IPs
 */
const setRateLimiter = (store) => (
    rateLimit({
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
            log.warn('Throttled! The system needs a sec.', {
                ip: request.ip,
                path: request.path,
                method: request.method,
                limit: isAuthRoute(request.path)  
                    ? ENV.RATE_LIMIT_MIN 
                    : ENV.RATE_LIMIT_MAX,
                windowMs: ENV.RATE_LIMIT_WINDOW_MS
            });
            
            response.status(429).json({
                message: 'You\'ve hit the limit. Try again in a bit'
            });
    
        },
        // Skip rate limiting for local development IPs
        skip: (request) => shouldSkipRateLimit(request),
        ...store ? { store } : {},
    })
);

/**
 * Configures a speed limiter middleware to progressively slow down requests
 * based on usage intensity and route type.
 * 
 * @param {Object} [store] - Optional store for tracking request metrics
 * @returns {Function} A middleware function that applies progressive request delays
 * @property {number} windowMs - Time window for tracking request frequency
 * @property {number} delayAfter - Number of requests allowed before delays begin
 * @property {Function} delayMs - Dynamic delay calculation based on request usage
 * @property {number} maxDelayMs - Maximum delay between requests
 */
const setSpeedLimiter = (store) => (
    slowDown({
        windowMs: ENV.SLOW_DOWN_WINDOW_MS,
        delayAfter: 60, 
        delayMs: (hits, request) => {
            const limit = isAuthRoute(request.path)
                ? ENV.RATE_LIMIT_MIN
                : ENV.RATE_LIMIT_MAX;
            const usage = (hits / limit) * 100;
    
            if (usage < 60) return 0; 
            const minDelay = 100;
            const maxDelay = 800;
            const factor = (usage - 60) / 40;
            const delay =  Math.min(minDelay + (maxDelay - minDelay) * factor, maxDelay);
    
            return Math.floor(delay);
        },
        maxDelayMs: 800,
        skip: (request) => shouldSkipRateLimit(request),
        ...store ? { store } : {},

    })
);

export { setRateLimiter, setSpeedLimiter };