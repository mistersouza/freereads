import { rateLimit } from 'express-rate-limit';
import { isIP } from 'net';
import { ENV } from '../config/env.js';
import { log } from '../errors/index.js';

/**
 * Finds authentication route
 * 
 * @param {string} path - The request path
 * @returns {boolean} True if the path is an auth route
 */
const isAuthRoute = (path) => /^\/api\/v1\/auth\/?.*$/i.test(path);

/**
 * Allow IP bypass rate limiting
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

        if (isIP(request.ip) === 0) {
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
        return false;
    }
};

/**
 * Rate Limiter Middleware
 * 
 * This middleware implements request rate limiting for the Express application to prevent
 * abuse and protect against brute force attacks. It uses the express-rate-limit package
 * to track and limit the number of requests from each IP address.
 * 
 * Configuration:
 * - windowMs: Time window in milliseconds during which requests are counted (defaults to 15 minutes)
 * - max: Maximum number of requests allowed within the window, varies by route type:
 *   - Auth routes (/auth): Lower limit (RATE_LIMIT_MIN) to prevent brute force attacks
 *   - Other routes: Higher limit (RATE_LIMIT_MAX) for normal API usage
 * - standardHeaders: Adds standard rate limit headers (X-RateLimit-*)
 * - legacyHeaders: Disables legacy rate limit headers
 * 
 * Behavior:
 * - When a client exceeds their rate limit, returns a 429 status with a custom message
 * - Local development IPs (specified in LOCAL_IPS env variable) bypass rate limiting
 * - Different error messages for auth routes vs. regular routes
 * 
 * Environment Variables:
 * - RATE_LIMIT_WINDOW_MS: Time window in milliseconds (default: 15 minutes)
 * - RATE_LIMIT_MIN: Request limit for auth routes
 * - RATE_LIMIT_MAX: Request limit for other routes
 * - LOCAL_IPS: Comma-separated list of IP addresses to skip rate limiting
 * 
 * @module middlewares/rate-limiter-middleware
 */

const limiter = rateLimit({
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
});

export { limiter };