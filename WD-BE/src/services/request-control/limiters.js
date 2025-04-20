import { rateLimit } from 'express-rate-limit';
import { slowDown } from 'express-slow-down';
import { ENV } from '../../config/env.js';
import { log } from '../error/index.js';
import { isAuthRoute, shouldSkipIP } from './utils.js';

/**
 * Sets the right rate limit based on user auth and route.
 *
 * @param {Object} request - Express request object
 * @returns {number} The rate limit value
 */
const getRateLimit = (request) => {
  if (request.user) return ENV.RATE_LIMIT_AUTHENTICATED;
  if (isAuthRoute(request.path)) return ENV.RATE_LIMIT_STRICT;
  return ENV.RATE_LIMIT_DEFAULT;
};

/**
 * Creates a rate limiter middleware
 */
const setRateLimiter = (store) => (
  rateLimit({
    windowMs: ENV.RATE_LIMIT_WINDOW_MS,
    max: (request, _response) => getRateLimit(request),
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (request) => (request.user
      ? `user:${request.user.id}`
      : `ip:${request.ip}`),
    handler: async (request, _response, next) => {
      const { status, message } = await request.app.locals.services.blacklist.blacklistIP(request.ip, 'Rate limit hit.');
      if (status === 'done') {
        log.warn('Someone\'s gone too far! ', {
          ip: request.ip,
          path: request.path,
          method: request.method,
          limit: getRateLimit(request),
        });
      }
      if (status === 'failed') {
        log.warn(`${message}`);
      }
      next();
    },
    skip: shouldSkipIP,
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
    keyGenerator: (request) => (request.user
      ? `user:${request.user.id}`
      : `ip:${request.ip}`),
    delayMs: (hits, request) => {
      const limit = getRateLimit(request);
      const usage = (hits / limit) * 100;

      if (usage < 60) return 0;
      const minDelay = 100;
      const maxDelay = 800;
      const factor = (usage - 60) / 40;
      const delay = Math.min(minDelay + (maxDelay - minDelay) * factor, maxDelay);

      if (usage > 70) {
        request.app.locals.services.blacklist
          .recordAttempt(request.ip, 'approaching-limit', limit, hits);
      }
      return Math.floor(delay);
    },
    maxDelayMs: 800,
    skip: shouldSkipIP,
    ...(store ? { store } : {}),
  })
);

export { setRateLimiter, setSpeedLimiter };
